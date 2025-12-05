import { useEffect, useRef, useState, useCallback } from "react";

function TimelineEntry({ entry, isLatest, index, total, languageA, languageB }) {
  const opacity = Math.max(0.4, 0.4 + ((index + 1) / total) * 0.6);
  const isPersonA = entry.speaker === "A";

  // Get flag emoji based on language
  const getFlag = (lang) => {
    const flags = {
      English: "🇺🇸",
      Korean: "🇰🇷",
      Spanish: "🇪🇸",
      French: "🇫🇷",
      German: "🇩🇪",
      Japanese: "🇯🇵",
      Chinese: "🇨🇳",
      Portuguese: "🇧🇷",
      Italian: "🇮🇹",
      Russian: "🇷🇺",
    };
    return flags[lang] || "🌐";
  };

  return (
    <div className="relative" style={{ opacity }}>
      {isPersonA ? (
        // Person A speaks (Left side)
        <>
          {/* Spoken (Left) */}
          <div className="relative mb-6">
            <div className="flex items-start">
              <div className="w-[calc(50%-16px)] flex justify-end pr-8">
                <div
                  className={`relative w-full max-w-sm ${isLatest ? "scale-105" : ""} transition-all duration-300`}
                >
                  <div className="flex items-center justify-end gap-2 mb-2">
                    <span className="text-xs text-gray-500">
                      {getFlag(languageA)} Person A
                    </span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold uppercase tracking-wide">
                      Spoken
                    </span>
                  </div>
                  <div
                    className={`p-4 rounded-2xl rounded-tr-sm shadow-sm border-2 ${isLatest ? "bg-blue-50 border-blue-300 shadow-lg" : "bg-white border-blue-100"}`}
                  >
                    <p
                      className={`text-right text-gray-900 leading-relaxed ${isLatest ? "text-lg font-medium" : "text-sm"}`}
                    >
                      {entry.sourceText}
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute left-1/2 top-8 -translate-x-1/2 z-10">
                <div
                  className={`w-4 h-4 rounded-full border-4 border-white shadow-sm ${isLatest ? "bg-blue-500 ring-4 ring-blue-200" : "bg-blue-300"}`}
                />
              </div>

              <div className="w-[calc(50%-16px)]" />
            </div>
          </div>

          {/* Translated (Right) */}
          <div className="relative">
            <div className="flex items-start">
              <div className="w-[calc(50%-16px)]" />

              <div className="absolute left-1/2 top-8 -translate-x-1/2 z-10">
                <div
                  className={`w-4 h-4 rounded-full border-4 border-white shadow-sm ${isLatest ? "bg-gray-400 ring-4 ring-gray-200" : "bg-gray-300"}`}
                />
              </div>

              <div className="w-[calc(50%-16px)] flex justify-start pl-8">
                <div
                  className={`relative w-full max-w-sm ${isLatest ? "scale-105" : ""} transition-all duration-300`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-bold uppercase tracking-wide">
                      Translated
                    </span>
                    <span className="text-xs text-gray-400">
                      {getFlag(languageB)} for Person B
                    </span>
                  </div>
                  <div
                    className={`p-4 rounded-2xl rounded-tl-sm shadow-sm border-2 ${isLatest ? "bg-gray-50 border-gray-300 shadow-lg" : "bg-white border-gray-100"}`}
                  >
                    <p
                      className={`text-left text-gray-700 leading-relaxed ${isLatest ? "text-lg" : "text-sm"}`}
                    >
                      {entry.translatedText}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        // Person B speaks (Right side)
        <>
          {/* Spoken (Right) */}
          <div className="relative mb-6">
            <div className="flex items-start">
              <div className="w-[calc(50%-16px)]" />

              <div className="absolute left-1/2 top-8 -translate-x-1/2 z-10">
                <div
                  className={`w-4 h-4 rounded-full border-4 border-white shadow-sm ${isLatest ? "bg-green-500 ring-4 ring-green-200" : "bg-green-300"}`}
                />
              </div>

              <div className="w-[calc(50%-16px)] flex justify-start pl-8">
                <div
                  className={`relative w-full max-w-sm ${isLatest ? "scale-105" : ""} transition-all duration-300`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold uppercase tracking-wide">
                      Spoken
                    </span>
                    <span className="text-xs text-gray-500">
                      {getFlag(languageB)} Person B
                    </span>
                  </div>
                  <div
                    className={`p-4 rounded-2xl rounded-tl-sm shadow-sm border-2 ${isLatest ? "bg-green-50 border-green-300 shadow-lg" : "bg-white border-green-100"}`}
                  >
                    <p
                      className={`text-left text-gray-900 leading-relaxed ${isLatest ? "text-lg font-medium" : "text-sm"}`}
                    >
                      {entry.sourceText}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Translated (Left) */}
          <div className="relative">
            <div className="flex items-start">
              <div className="w-[calc(50%-16px)] flex justify-end pr-8">
                <div
                  className={`relative w-full max-w-sm ${isLatest ? "scale-105" : ""} transition-all duration-300`}
                >
                  <div className="flex items-center justify-end gap-2 mb-2">
                    <span className="text-xs text-gray-400">
                      {getFlag(languageA)} for Person A
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-bold uppercase tracking-wide">
                      Translated
                    </span>
                  </div>
                  <div
                    className={`p-4 rounded-2xl rounded-tr-sm shadow-sm border-2 ${isLatest ? "bg-gray-50 border-gray-300 shadow-lg" : "bg-white border-gray-100"}`}
                  >
                    <p
                      className={`text-right text-gray-700 leading-relaxed ${isLatest ? "text-lg" : "text-sm"}`}
                    >
                      {entry.translatedText}
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute left-1/2 top-8 -translate-x-1/2 z-10">
                <div
                  className={`w-4 h-4 rounded-full border-4 border-white shadow-sm ${isLatest ? "bg-gray-400 ring-4 ring-gray-200" : "bg-gray-300"}`}
                />
              </div>

              <div className="w-[calc(50%-16px)]" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ConversationTimeline({
  translations,
  languageA,
  languageB,
}) {
  const scrollRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Check if user is near bottom (within 100px)
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldAutoScroll(isNearBottom);
    }
  }, []);

  // Auto-scroll to latest entry only if user hasn't scrolled up
  useEffect(() => {
    if (scrollRef.current && shouldAutoScroll) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [translations, shouldAutoScroll]);

  if (translations.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <p>Start speaking to see translations...</p>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto" onScroll={handleScroll}>
      <div className="mb-12">
        {/* Timeline Header */}
        <div className="flex justify-between items-center mb-8 px-4">
          <h2 className="text-sm font-medium text-gray-600">
            conversation timeline
          </h2>
          <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                PERSON A
              </div>
              <span className="text-gray-500">{languageA} Speaker</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                PERSON B
              </div>
              <span className="text-gray-500">{languageB} Speaker</span>
            </div>
          </div>
        </div>

        {/* Timeline Container */}
        <div className="relative px-4">
          {/* Center Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2" />

          {/* Timeline Items */}
          <div className="space-y-12">
            {translations.map((entry, index) => (
              <TimelineEntry
                key={entry.id}
                entry={entry}
                isLatest={index === translations.length - 1}
                index={index}
                total={translations.length}
                languageA={languageA}
                languageB={languageB}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
