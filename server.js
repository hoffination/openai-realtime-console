import express from "express";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import "dotenv/config";

const app = express();
app.use(express.text());
app.use(express.json());
const port = process.env.PORT || 3000;

// Configure Vite middleware for React client
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: "custom",
});
app.use(vite.middlewares);

// Session configuration for transcription-focused realtime session
// Using /v1/realtime/client_secrets endpoint (requires session wrapper)
const getSessionConfig = (turnDetectionType = "server_vad") => ({
  session: {
    type: "realtime",
    model: "gpt-realtime",
    instructions: "Transcribe audio. Do not respond with audio.",
    audio: {
      input: {
        transcription: {
          model: "whisper-1",
        },
        turn_detection:
          turnDetectionType === "none"
            ? null
            : {
                type: "server_vad",
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 200,
              },
      },
    },
  },
});

// API route for ephemeral token generation
app.get("/token", async (req, res) => {
  const turnDetection = req.query.turnDetection || "server_vad";
  const clientApiKey = req.headers["x-api-key"];

  if (!clientApiKey) {
    return res.status(400).json({ error: "API key required" });
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${clientApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(getSessionConfig(turnDetection)),
      },
    );

    const data = await response.json();
    console.log("OpenAI session response:", JSON.stringify(data, null, 2));
    res.json(data);
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

// API route for translation
app.post("/translate", async (req, res) => {
  const { text, languageA, languageB } = req.body;
  const clientApiKey = req.headers["x-api-key"];

  if (!clientApiKey) {
    return res.status(400).json({ error: "API key required" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clientApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a translation assistant. Given text, detect if it's in ${languageA} or ${languageB}, then translate to the other language. Respond in JSON format only: {"detectedLanguage": "...", "sourceText": "...", "translatedText": "...", "targetLanguage": "..."}`,
          },
          {
            role: "user",
            content: text,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    const translation = JSON.parse(data.choices[0].message.content);
    res.json(translation);
  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({ error: "Failed to translate" });
  }
});

// Render the React client
app.use("*", async (req, res, next) => {
  const url = req.originalUrl;

  try {
    const template = await vite.transformIndexHtml(
      url,
      fs.readFileSync("./client/index.html", "utf-8"),
    );
    const { render } = await vite.ssrLoadModule("./client/entry-server.jsx");
    const appHtml = await render(url);
    const html = template.replace("<!--ssr-outlet-->", appHtml?.html);
    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  } catch (e) {
    vite.ssrFixStacktrace(e);
    next(e);
  }
});

app.listen(port, () => {
  console.log(`Express server running on *:${port}`);
});
