import { useEffect, useRef, useState, useCallback } from 'react';
import './ConversationTimeline.scss';

interface Translation {
  sourceLanguage: string;
  sourceText: string;
  targetLanguage: string;
  targetText: string;
  timestamp: string;
}

interface ConversationTimelineProps {
  translations: Translation[];
  languageA: string;
  languageB: string;
}

// Get flag emoji based on language
const getFlag = (language: string): string => {
  const flags: Record<string, string> = {
    English: '\u{1F1FA}\u{1F1F8}',
    Korean: '\u{1F1F0}\u{1F1F7}',
    Japanese: '\u{1F1EF}\u{1F1F5}',
    Chinese: '\u{1F1E8}\u{1F1F3}',
    Spanish: '\u{1F1EA}\u{1F1F8}',
    French: '\u{1F1EB}\u{1F1F7}',
    German: '\u{1F1E9}\u{1F1EA}',
    Italian: '\u{1F1EE}\u{1F1F9}',
    Portuguese: '\u{1F1F5}\u{1F1F9}',
    Russian: '\u{1F1F7}\u{1F1FA}',
    Arabic: '\u{1F1F8}\u{1F1E6}',
    Hindi: '\u{1F1EE}\u{1F1F3}',
  };
  return flags[language] || '\u{1F310}';
};

function TimelineEntry({
  entry,
  index,
  total,
  languageA,
}: {
  entry: Translation;
  index: number;
  total: number;
  languageA: string;
}) {
  const opacity = Math.max(0.4, 0.4 + ((index + 1) / total) * 0.6);
  const isPersonA = entry.sourceLanguage === languageA;

  return (
    <div
      className={`timeline-entry ${isPersonA ? 'person-a' : 'person-b'}`}
      style={{ opacity }}
    >
      {/* Person A - Left side */}
      {isPersonA ? (
        <>
          <div className="entry-content left">
            <div className="bubble spoken">
              <span className="flag">{getFlag(entry.sourceLanguage)}</span>
              <span className="text">{entry.sourceText}</span>
            </div>
            <div className="bubble translated">
              <span className="flag">{getFlag(entry.targetLanguage)}</span>
              <span className="text">{entry.targetText}</span>
            </div>
          </div>
          <div className="timeline-marker">
            <div className="marker-dot a" />
            <div className="marker-line" />
          </div>
          <div className="entry-spacer" />
        </>
      ) : (
        <>
          <div className="entry-spacer" />
          <div className="timeline-marker">
            <div className="marker-dot b" />
            <div className="marker-line" />
          </div>
          <div className="entry-content right">
            <div className="bubble spoken">
              <span className="flag">{getFlag(entry.sourceLanguage)}</span>
              <span className="text">{entry.sourceText}</span>
            </div>
            <div className="bubble translated">
              <span className="flag">{getFlag(entry.targetLanguage)}</span>
              <span className="text">{entry.targetText}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function ConversationTimeline({
  translations,
  languageA,
  languageB,
}: ConversationTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldAutoScroll(isNearBottom);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current && shouldAutoScroll) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [translations, shouldAutoScroll]);

  if (translations.length === 0) {
    return (
      <div className="conversation-timeline empty">
        <p>Start speaking to see translations appear here</p>
        <p className="hint">
          {getFlag(languageA)} {languageA} \u2194 {languageB} {getFlag(languageB)}
        </p>
      </div>
    );
  }

  return (
    <div
      className="conversation-timeline"
      ref={scrollRef}
      onScroll={handleScroll}
    >
      {/* Timeline Header */}
      <div className="timeline-header">
        <div className="speaker-label left">
          <span className="flag">{getFlag(languageA)}</span>
          <span>{languageA}</span>
        </div>
        <div className="center-line" />
        <div className="speaker-label right">
          <span>{languageB}</span>
          <span className="flag">{getFlag(languageB)}</span>
        </div>
      </div>

      {/* Timeline Entries */}
      <div className="timeline-entries">
        {translations.map((entry, index) => (
          <TimelineEntry
            key={index}
            entry={entry}
            index={index}
            total={translations.length}
            languageA={languageA}
          />
        ))}
      </div>
    </div>
  );
}
