
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { neonViolet: "#8B5CF6", neonCyan: "#06B6D4",
      'icon-pen': '#7dd3fc', // Светло-голубой для ручки
      'icon-folder': '#c4b5fd', // Фиолетовый для папки
      'icon-linkedin': '#38bdf8' // Голубой для LinkedIn
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
