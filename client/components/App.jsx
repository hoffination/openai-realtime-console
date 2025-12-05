import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "react-feather";
import logo from "/assets/openai-logomark.svg";
import EventLog from "./EventLog";
import SessionControls from "./SessionControls";
import ToolPanel from "./ToolPanel";
import ConversationTimeline from "./ConversationTimeline";

export default function App() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [events, setEvents] = useState([]);
  const [dataChannel, setDataChannel] = useState(null);
  const peerConnection = useRef(null);
  const mediaStream = useRef(null);

  // Translation app state
  const [translations, setTranslations] = useState([]);
  const [languageA, setLanguageA] = useState("English");
  const [languageB, setLanguageB] = useState("Korean");
  const [inputMode, setInputMode] = useState("vad");
  const [isRecording, setIsRecording] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("openai-api-key") || "";
    }
    return "";
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isEditingKey, setIsEditingKey] = useState(false);

  // Persist API key to localStorage
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem("openai-api-key", apiKey);
    }
  }, [apiKey]);

  async function startSession() {
    if (!apiKey) {
      alert("Please enter your OpenAI API key");
      return;
    }

    // Get a transcription session token
    const turnDetection = inputMode === "vad" ? "server_vad" : "none";
    const tokenResponse = await fetch(`/token?turnDetection=${turnDetection}`, {
      headers: { "X-API-Key": apiKey },
    });
    const data = await tokenResponse.json();
    console.log("Token response:", data);

    if (data.error) {
      console.error("API error:", data.error);
      alert(`API Error: ${data.error.message || data.error}`);
      throw new Error(data.error.message || "API error");
    }

    const EPHEMERAL_KEY = data.client_secret?.value || data.value;
    console.log("Ephemeral key prefix:", EPHEMERAL_KEY?.substring(0, 10));

    if (!EPHEMERAL_KEY) {
      console.error("No ephemeral key in response:", data);
      alert("Failed to get session token. Check your API key.");
      throw new Error("Failed to get ephemeral key");
    }

    // Create a peer connection
    const pc = new RTCPeerConnection();

    // Add local audio track for microphone input
    const ms = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    mediaStream.current = ms;
    const audioTrack = ms.getTracks()[0];

    // For push-to-talk, start with track disabled
    if (inputMode === "push-to-talk") {
      audioTrack.enabled = false;
    }

    pc.addTrack(audioTrack);

    // Set up data channel for sending and receiving events
    const dc = pc.createDataChannel("oai-events");
    setDataChannel(dc);

    // Start the session using the Session Description Protocol (SDP)
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    console.log("Offer SDP (first 200 chars):", offer.sdp.substring(0, 200));

    const baseUrl = "https://api.openai.com/v1/realtime/calls";
    const model = "gpt-realtime";
    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
      method: "POST",
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${EPHEMERAL_KEY}`,
        "Content-Type": "application/sdp",
      },
    });

    const sdpText = await sdpResponse.text();
    console.log("SDP response status:", sdpResponse.status);
    console.log("SDP response:", sdpText.substring(0, 500));

    if (!sdpResponse.ok) {
      console.error("SDP exchange failed:", sdpResponse.status, sdpText);
      throw new Error(`SDP exchange failed: ${sdpResponse.status}`);
    }

    const sdp = sdpText;
    const answer = { type: "answer", sdp };
    await pc.setRemoteDescription(answer);

    peerConnection.current = pc;
  }

  // Stop current session, clean up peer connection and data channel
  function stopSession() {
    if (dataChannel) {
      dataChannel.close();
    }

    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach((track) => track.stop());
      mediaStream.current = null;
    }

    if (peerConnection.current) {
      peerConnection.current.close();
    }

    setIsSessionActive(false);
    setDataChannel(null);
    peerConnection.current = null;
    setIsRecording(false);
  }

  // Handle transcription by sending to translation API
  const handleTranscription = useCallback(
    async (transcript) => {
      try {
        const response = await fetch("/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": apiKey,
          },
          body: JSON.stringify({
            text: transcript,
            languageA,
            languageB,
          }),
        });

        const translation = await response.json();

        // Determine speaker based on detected language
        const speaker = translation.detectedLanguage === languageA ? "A" : "B";

        const entry = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          speaker,
          sourceText: translation.sourceText,
          sourceLanguage: translation.detectedLanguage,
          translatedText: translation.translatedText,
          targetLanguage: translation.targetLanguage,
        };

        setTranslations((prev) => [...prev, entry]);
      } catch (error) {
        console.error("Translation failed:", error);
      }
    },
    [languageA, languageB, apiKey],
  );

  // Push-to-talk controls
  const startRecording = useCallback(() => {
    if (mediaStream.current) {
      mediaStream.current.getTracks()[0].enabled = true;
      setIsRecording(true);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaStream.current) {
      mediaStream.current.getTracks()[0].enabled = false;
      setIsRecording(false);

      // Commit the audio buffer to trigger transcription
      if (dataChannel) {
        const event = {
          type: "input_audio_buffer.commit",
          event_id: crypto.randomUUID(),
        };
        dataChannel.send(JSON.stringify(event));
        setEvents((prev) => [{ ...event, timestamp: new Date().toLocaleTimeString() }, ...prev]);
      }
    }
  }, [dataChannel]);

  // Send a message to the model
  function sendClientEvent(message) {
    if (dataChannel) {
      const timestamp = new Date().toLocaleTimeString();
      message.event_id = message.event_id || crypto.randomUUID();

      // send event before setting timestamp since the backend peer doesn't expect this field
      dataChannel.send(JSON.stringify(message));

      // if guard just in case the timestamp exists by miracle
      if (!message.timestamp) {
        message.timestamp = timestamp;
      }
      setEvents((prev) => [message, ...prev]);
    } else {
      console.error(
        "Failed to send message - no data channel available",
        message,
      );
    }
  }

  // Attach event listeners to the data channel when a new one is created
  useEffect(() => {
    if (dataChannel) {
      // Append new server events to the list
      const handleMessage = async (e) => {
        const event = JSON.parse(e.data);
        if (!event.timestamp) {
          event.timestamp = new Date().toLocaleTimeString();
        }

        setEvents((prev) => [event, ...prev]);

        // Handle transcription completion events
        if (
          event.type === "conversation.item.input_audio_transcription.completed"
        ) {
          const transcript = event.transcript;
          if (transcript && transcript.trim()) {
            await handleTranscription(transcript);
          }
        }
      };

      // Set session active when the data channel is opened
      const handleOpen = () => {
        setIsSessionActive(true);
        setEvents([]);
        setTranslations([]);
      };

      dataChannel.addEventListener("message", handleMessage);
      dataChannel.addEventListener("open", handleOpen);

      return () => {
        dataChannel.removeEventListener("message", handleMessage);
        dataChannel.removeEventListener("open", handleOpen);
      };
    }
  }, [dataChannel, handleTranscription]);

  return (
    <>
      <nav className="absolute top-0 left-0 right-0 h-16 flex items-center">
        <div className="flex items-center justify-between w-full m-4 pb-2 border-0 border-b border-solid border-gray-200">
          <div className="flex items-center gap-4">
            <img style={{ width: "24px" }} src={logo} />
            <h1>realtime translator</h1>
          </div>
          {apiKey && !isEditingKey && (
            <button
              onClick={() => setIsEditingKey(true)}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
            >
              Edit API Key
            </button>
          )}
        </div>
      </nav>
      <main className="absolute top-16 left-0 right-0 bottom-0">
        {/* Main content area - ConversationTimeline */}
        <section
          className={`absolute top-0 left-0 bottom-0 flex flex-col transition-all duration-300 ${
            sidebarCollapsed ? "right-0" : "right-[380px]"
          }`}
        >
          <section className="flex-1 overflow-hidden">
            <ConversationTimeline
              translations={translations}
              languageA={languageA}
              languageB={languageB}
            />
          </section>
          <section className="h-32 p-4">
            <SessionControls
              startSession={startSession}
              stopSession={stopSession}
              isSessionActive={isSessionActive}
              languageA={languageA}
              setLanguageA={setLanguageA}
              languageB={languageB}
              setLanguageB={setLanguageB}
              inputMode={inputMode}
              setInputMode={setInputMode}
              isRecording={isRecording}
              startRecording={startRecording}
              stopRecording={stopRecording}
              apiKey={apiKey}
              setApiKey={setApiKey}
              isEditingKey={isEditingKey}
              setIsEditingKey={setIsEditingKey}
            />
          </section>
        </section>

        {/* Sidebar toggle button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className={`absolute top-4 z-20 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:bg-gray-50 transition-all duration-300 ${
            sidebarCollapsed ? "right-4" : "right-[392px]"
          }`}
          title={sidebarCollapsed ? "Show debug panel" : "Hide debug panel"}
        >
          {sidebarCollapsed ? (
            <ChevronLeft size={16} className="text-gray-500" />
          ) : (
            <ChevronRight size={16} className="text-gray-500" />
          )}
        </button>

        {/* Right sidebar - Settings + Event Log */}
        <section
          className={`absolute top-0 w-[380px] right-0 bottom-0 flex flex-col border-l border-gray-200 bg-white transition-transform duration-300 ${
            sidebarCollapsed ? "translate-x-full" : "translate-x-0"
          }`}
        >
          <div className="p-4 border-b border-gray-200">
            <ToolPanel
              isSessionActive={isSessionActive}
              languageA={languageA}
              languageB={languageB}
              translations={translations}
            />
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <h3 className="text-sm font-bold text-gray-500 mb-2">
              Debug Events
            </h3>
            <EventLog events={events} />
          </div>
        </section>
      </main>
    </>
  );
}
