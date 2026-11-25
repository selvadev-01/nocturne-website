import type { Config } from "tailwindcss";

// One radius for the whole site: 4px (ticket and signage feel).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "#0B1020",
        carriage: "#141B2E",
        rail: "#273049",
        paper: "#ECEEF2",
        fog: "#9AA3B5",
        lamp: "#FFB547",
        dawn: "#F6D3B8",
      },
      fontFamily: {
        display: ["var(--font-anybody)", "system-ui", "sans-serif"],
        sans: ["var(--font-instrument)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex)", "ui-monospace", "monospace"],
      },
      fontSize: {
        base: ["17px", { lineHeight: "1.6" }],
      },
      borderRadius: { DEFAULT: "4px", sm: "4px", md: "4px", lg: "4px" },
    },
  },
  plugins: [],
};
export default config;
