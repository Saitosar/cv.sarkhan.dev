// src/components/ThemeToggle.tsx
"use client";

export type Theme = 'dark' | 'light';

interface ThemeToggleProps {
  selectedTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export function ThemeToggle({ selectedTheme, onThemeChange }: ThemeToggleProps) {
  return (
    <div>
      <h4 className="font-display text-sm mb-2 text-center text-white/70">Mode</h4>
      <div className="flex justify-center items-center bg-white/10 rounded-full p-1">
        <button 
          onClick={() => onThemeChange('light')}
          className={`px-4 py-1 text-xs rounded-full transition-all ${selectedTheme === 'light' ? 'bg-white text-black' : 'text-white'}`}
        >
          Light
        </button>
        <button 
          onClick={() => onThemeChange('dark')}
          className={`px-4 py-1 text-xs rounded-full transition-all ${selectedTheme === 'dark' ? 'bg-white text-black' : 'text-white'}`}
        >
          Dark
        </button>
      </div>
    </div>
  );
}