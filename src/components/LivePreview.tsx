// src/components/LivePreview.tsx
import type { TemplateName } from "./TemplateSelector";
import type { Theme } from "./ThemeToggle";
import type { ColorScheme } from "@/lib/palettes";
import { ClassicTemplate } from "./templates/ClassicTemplate";
import { ModernTemplate } from "./templates/ModernTemplate";
import { CreativeTemplate } from "./templates/CreativeTemplate";
import { placeholderResume } from "@/lib/placeholder-data";

interface LivePreviewProps {
  data: { result: string; } | null;
  template: TemplateName;
  accentColor: ColorScheme; // Добавляем цвет
  theme: Theme;             // Добавляем тему
}

export function LivePreview({ data, template, accentColor, theme }: LivePreviewProps) {
  let resume;
  try {
    resume = (data && data.result) ? JSON.parse(data.result) : placeholderResume;
  } catch (error) {
    resume = placeholderResume; 
  }

  // Передаем новые пропсы в каждый шаблон
  switch (template) {
    case "Классический":
      return <ClassicTemplate resume={resume} accentColor={accentColor} />;
    case "Современный":
      return <ModernTemplate resume={resume} accentColor={accentColor} />;
    case "Креативный":
      return <CreativeTemplate resume={resume} accentColor={accentColor} theme={theme} />;
    default:
      return <ClassicTemplate resume={resume} accentColor={accentColor} />;
  }
}