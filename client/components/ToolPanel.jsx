export default function ToolPanel({
  isSessionActive,
  languageA,
  languageB,
  translations,
}) {
  return (
    <section className="h-full w-full flex flex-col gap-4">
      <div className="bg-gray-50 rounded-md p-4">
        <h2 className="text-lg font-bold mb-2">Translation Settings</h2>
        {isSessionActive ? (
          <div className="space-y-2">
            <p>
              <strong>Languages:</strong> {languageA} ↔ {languageB}
            </p>
            <p>
              <strong>Translations:</strong> {translations.length}
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Speak in either language. The app will detect which language
              you&apos;re speaking and translate to the other.
            </p>
          </div>
        ) : (
          <p className="text-gray-500">
            Select your languages and start a session to begin translating.
          </p>
        )}
      </div>
    </section>
  );
}
