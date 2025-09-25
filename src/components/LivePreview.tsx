// src/components/LivePreview.tsx
import type { TemplateName } from "./TemplateSelector";
import { ClassicTemplate } from "./templates/ClassicTemplate";
import { ModernTemplate } from "./templates/ModernTemplate";
import { CreativeTemplate } from "./templates/CreativeTemplate";
import { placeholderResume } from "@/lib/placeholder-data";

interface LivePreviewProps {
  data: {
    result: string;
  } | null;
  template: TemplateName; // Добавляем пропс для имени шаблона
}

export function LivePreview({ data, template }: LivePreviewProps) {
  let resume;

  try {
    // 2. Если есть реальные данные, используем их
    if (data && data.result) {
      resume = JSON.parse(data.result);
    } else {
      // 3. Если реальных данных нет, используем наши демо-данные
      resume = placeholderResume;
    }
  } catch (error) {
    console.error("Failed to parse resume data:", error);
    // В случае ошибки парсинга, тоже показываем демо-данные
    resume = placeholderResume; 
  }

    // В зависимости от пропса 'template' рендерим нужный компонент
    switch (template) {
      case "Классический":
        return <ClassicTemplate resume={resume} />;
      case "Современный":
        return <ModernTemplate resume={resume} />;
      case "Креативный":
        return <CreativeTemplate resume={resume} />;
      default:
        return <ClassicTemplate resume={resume} />;
    }
}