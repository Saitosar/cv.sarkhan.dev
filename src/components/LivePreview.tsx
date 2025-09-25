// src/components/LivePreview.tsx

// 1. Описываем, как выглядят наши пропсы
interface LivePreviewProps {
  data: {
    result: string;
  } | null; // data может быть объектом с полем 'result' или null
}

// 2. Применяем тип к пропсам
export function LivePreview({ data }: LivePreviewProps) {
  if (!data || !data.result) {
    return <div className="text-center text-white/50">Your generated resume will appear here.</div>;
  }

  try {
    // 3. Парсим JSON из строки data.result
    const resume = JSON.parse(data.result);

    return (
      <div className="bg-white text-black p-8 rounded-lg gradient-border">
        {resume.summary && (
          <>
            <h2 className="text-2xl font-bold mb-2">Professional Summary</h2>
            <p className="mb-4">{resume.summary}</p>
          </>
        )}
        
        {resume.achievements && (
          <>
            <h2 className="text-2xl font-bold mb-2">Achievements</h2>
            <ul className="list-disc list-inside mb-4">
              {resume.achievements?.map((ach: string, index: number) => (
                <li key={index}>{ach}</li>
              ))}
            </ul>
          </>
        )}

        {resume.skills && (
          <>
            <h2 className="text-2xl font-bold mb-2">Skills</h2>
            <p>{resume.skills?.join(', ')}</p>
          </>
        )}
      </div>
    );
  } catch (error) {
    console.error("Failed to parse resume data:", error);
    return <div className="text-center text-red-400">Error displaying preview.</div>;
  }
}