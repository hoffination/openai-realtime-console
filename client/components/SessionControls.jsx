import { useState, useEffect } from "react";
import { CloudLightning, CloudOff, Mic } from "react-feather";
import Button from "./Button";

const LANGUAGES = [
  "English",
  "Korean",
  "Spanish",
  "French",
  "German",
  "Japanese",
  "Chinese",
  "Portuguese",
  "Italian",
  "Russian",
];

function SessionStopped({
  startSession,
  languageA,
  setLanguageA,
  languageB,
  setLanguageB,
  inputMode,
  setInputMode,
  apiKey,
  setApiKey,
  isEditingKey,
  setIsEditingKey,
}) {
  const [isActivating, setIsActivating] = useState(false);
  const [keyInput, setKeyInput] = useState(apiKey);

  // Sync keyInput when entering edit mode
  useEffect(() => {
    if (isEditingKey) {
      setKeyInput(apiKey);
    }
  }, [isEditingKey, apiKey]);

  function handleStartSession() {
    if (isActivating) return;

    setIsActivating(true);
    startSession();
  }

  function handleKeySubmit(e) {
    e.preventDefault();
    if (keyInput.trim()) {
      setApiKey(keyInput.trim());
      setIsEditingKey(false);
    }
  }

  if (!apiKey || isEditingKey) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full gap-3">
        <p className="text-gray-500 text-sm">
          {isEditingKey ? "Update your API key" : "Enter your OpenAI API key to get started"}
        </p>
        <form onSubmit={handleKeySubmit} className="flex items-center gap-2 w-full max-w-md">
          <input
            type="password"
            placeholder="OpenAI API Key (sk-...)"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            className="border border-gray-200 rounded-lg p-2 flex-1 text-sm"
            autoFocus
          />
          <button
            type="submit"
            className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm hover:bg-gray-700"
          >
            Save
          </button>
          {isEditingKey && (
            <button
              type="button"
              onClick={() => {
                setKeyInput(apiKey);
                setIsEditingKey(false);
              }}
              className="text-gray-500 text-sm hover:text-gray-700"
            >
              Cancel
            </button>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-3">
      {/* Language Selection */}
      <div className="flex items-center gap-4">
        <select
          value={languageA}
          onChange={(e) => setLanguageA(e.target.value)}
          className="border border-gray-200 rounded-lg p-2 bg-white"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
        <span className="text-gray-500 text-lg">↔</span>
        <select
          value={languageB}
          onChange={(e) => setLanguageB(e.target.value)}
          className="border border-gray-200 rounded-lg p-2 bg-white"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      {/* Input Mode Toggle */}
      <div className="flex items-center gap-4 text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="inputMode"
            value="vad"
            checked={inputMode === "vad"}
            onChange={() => setInputMode("vad")}
            className="accent-blue-500"
          />
          <span>Voice Activity Detection</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="inputMode"
            value="push-to-talk"
            checked={inputMode === "push-to-talk"}
            onChange={() => setInputMode("push-to-talk")}
            className="accent-blue-500"
          />
          <span>Push-to-Talk</span>
        </label>
      </div>

      {/* Start Button */}
      <Button
        onClick={handleStartSession}
        className={isActivating ? "bg-gray-600" : "bg-red-600"}
        icon={<CloudLightning height={16} />}
      >
        {isActivating ? "starting session..." : "start session"}
      </Button>
    </div>
  );
}

function SessionActive({
  stopSession,
  inputMode,
  isRecording,
  startRecording,
  stopRecording,
}) {
  return (
    <div className="flex items-center justify-center w-full h-full gap-4">
      {inputMode === "push-to-talk" && (
        <Button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          className={isRecording ? "bg-red-600" : "bg-blue-500"}
          icon={<Mic height={16} />}
        >
          {isRecording ? "Recording..." : "Hold to Talk"}
        </Button>
      )}

      {inputMode === "vad" && (
        <div className="text-gray-500 flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
          <Mic height={16} className="text-green-500" />
          <span className="text-green-700">Listening...</span>
        </div>
      )}

      <Button onClick={stopSession} icon={<CloudOff height={16} />}>
        disconnect
      </Button>
    </div>
  );
}

export default function SessionControls({
  startSession,
  stopSession,
  isSessionActive,
  languageA,
  setLanguageA,
  languageB,
  setLanguageB,
  inputMode,
  setInputMode,
  isRecording,
  startRecording,
  stopRecording,
  apiKey,
  setApiKey,
  isEditingKey,
  setIsEditingKey,
}) {
  return (
    <div className="flex gap-4 border-t-2 border-gray-200 h-full rounded-md">
      {isSessionActive ? (
        <SessionActive
          stopSession={stopSession}
          inputMode={inputMode}
          isRecording={isRecording}
          startRecording={startRecording}
          stopRecording={stopRecording}
        />
      ) : (
        <SessionStopped
          startSession={startSession}
          languageA={languageA}
          setLanguageA={setLanguageA}
          languageB={languageB}
          setLanguageB={setLanguageB}
          inputMode={inputMode}
          setInputMode={setInputMode}
          apiKey={apiKey}
          setApiKey={setApiKey}
          isEditingKey={isEditingKey}
          setIsEditingKey={setIsEditingKey}
        />
      )}
    </div>
  );
}
