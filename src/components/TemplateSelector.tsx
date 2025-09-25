// src/components/TemplateSelector.tsx
"use client";

// Определяем типы шаблонов для надежности
export type TemplateName = "Классический" | "Современный" | "Креативный";
const templates: TemplateName[] = ["Классический", "Современный", "Креативный"];

interface TemplateSelectorProps {
  selectedTemplate: TemplateName;
  onTemplateChange: (template: TemplateName) => void;
}

export function TemplateSelector({ selectedTemplate, onTemplateChange }: TemplateSelectorProps) {
  return (
    <div>
      <h3 className="font-display text-xl mb-4 text-center">Select a Template</h3>
      <div className="grid grid-cols-3 gap-4">
        {templates.map((template) => (
          <button
            key={template}
            onClick={() => onTemplateChange(template)}
            className={`p-4 rounded-lg text-center transition-all duration-200 font-sans
              ${selectedTemplate === template 
                ? 'border bg-white/20' // Стиль для активного шаблона
                : 'bg-white/10 hover:bg-white/20' // Стиль для неактивных
              }`}
          >
            {template}
          </button>
        ))}
      </div>
    </div>
  );
}