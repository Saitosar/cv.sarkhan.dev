
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
      'icon-pen': '#7dd3fc',
      'icon-folder': '#c4b5fd',
      'icon-linkedin': '#38bdf8',
      neonViolet: "#8B5CF6",
      neonCyan: "#06B6D4",
    },
      fontFamily: {
        display: ["'Space Grotesk'", "ui-sans-serif", "system-ui"],
        body: ["Inter", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        neon: "0 0 20px rgba(139,92,246,.35), 0 0 30px rgba(6,182,212,.25)",
      },
    },
  },
  plugins: [],
};
