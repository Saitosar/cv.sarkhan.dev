// src/components/TemplateSelector.tsx
"use client";

// Определяем константы для названий шаблонов
export const TEMPLATE_NAMES = {
  CLASSIC: "Классический",
  MODERN: "Современный",
  CREATIVE: "Креативный",
} as const;

// Создаем тип на основе этих констант
export type TemplateName = typeof TEMPLATE_NAMES[keyof typeof TEMPLATE_NAMES];

// Используем константы для создания массива
const templates: TemplateName[] = [TEMPLATE_NAMES.CLASSIC, TEMPLATE_NAMES.MODERN, TEMPLATE_NAMES.CREATIVE];

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