"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className="flex h-10 w-10 items-center justify-center rounded-xl glass-panel text-[#e5e2e1] opacity-60"
      >
        <Moon size={18} />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex h-10 w-10 items-center justify-center rounded-xl glass-panel text-[#e5e2e1] hover:bg-[#353434] active:scale-95"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
