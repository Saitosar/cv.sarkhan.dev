// src/components/ColorPalette.tsx
"use client";
import type { ColorScheme } from "@/lib/palettes";

interface ColorPaletteProps {
  palettes: ColorScheme[];
  selectedColor: ColorScheme;
  onColorChange: (color: ColorScheme) => void;
}

export function ColorPalette({ palettes, selectedColor, onColorChange }: ColorPaletteProps) {
  return (
    <div>
      <h4 className="font-display text-sm mb-2 text-center text-white/70">Accent Color</h4>
      <div className="flex justify-center items-center gap-3">
        {palettes.map((color) => (
          <button
            key={color.name}
            title={color.name}
            onClick={() => onColorChange(color)}
            className={`w-6 h-6 rounded-full transition-all duration-200
              ${selectedColor.name === color.name ? 'ring-2 ring-offset-2 ring-offset-black ring-white' : ''}
            `}
            style={{ backgroundColor: color.primary }}
          />
        ))}
      </div>
    </div>
  );
}