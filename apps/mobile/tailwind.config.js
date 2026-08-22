/** @type {import('tailwindcss').Config} */
// Colors mirror apps/web/src/app/globals.css exactly, so the same
// className vocabulary (bg-primary, text-ink, border-line, ...) produces
// the same look on both platforms.
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  // This app doesn't implement a dark theme (neither does apps/web) — "class"
  // avoids a NativeWind/react-native-web runtime conflict where something
  // (expo-router's navigation theming) tries to set the color scheme
  // manually, which only "class" mode supports.
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#fdfbf8",
        ink: "#1a1a1a",
        primary: {
          DEFAULT: "#be7374",
          dark: "#a35c5d",
        },
        secondary: "#fed2cc",
        cream: "#f6ede7",
        muted: "#767676",
        line: "#ece3dc",
      },
      fontFamily: {
        sans: ["Jost_400Regular"],
        "sans-medium": ["Jost_500Medium"],
        "sans-semibold": ["Jost_600SemiBold"],
        script: ["Sacramento_400Regular"],
      },
    },
  },
  plugins: [],
};
