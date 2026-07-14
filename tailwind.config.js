
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
      neonViolet: "#6001d1",
      neonCyan: "#4F46E5",
    },
      fontFamily: {
        display: ["'Space Grotesk'", "ui-sans-serif", "system-ui"],
        body: ["Inter", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        neon: "0 0 20px rgba(96,1,209,.35), 0 0 30px rgba(79,70,229,.25)",
      },
    },
  },
  plugins: [],
};
