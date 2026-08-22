// JS-side mirror of the color tokens in tailwind.config.js (which in turn
// mirror apps/web/src/app/globals.css exactly). className strings can't be
// used for things like icon `color` props or StyleSheet objects, so this
// is the one other place these values are allowed to be hardcoded.
export const colors = {
  background: "#fdfbf8",
  ink: "#1a1a1a",
  primary: "#be7374",
  primaryDark: "#a35c5d",
  secondary: "#fed2cc",
  cream: "#f6ede7",
  muted: "#767676",
  line: "#ece3dc",
  white: "#ffffff",
} as const;
