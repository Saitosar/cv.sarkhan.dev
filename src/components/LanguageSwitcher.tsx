'use client';

import * as React from 'react';

export function LanguageSwitcher() {
  return (
    <select
      aria-label="Switch language"
      className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#1c1b1b] px-2 py-1 text-xs text-[#c4c7c7]"
      defaultValue="en"
    >
      <option value="en">EN</option>
      <option value="ru">RU</option>
    </select>
  );
}
