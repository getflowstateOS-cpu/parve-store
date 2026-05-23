import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: [
          "var(--font-playfair)",
          "Playfair Display",
          "Georgia",
          "serif",
        ],
        sans: [
          "var(--font-inter)",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
      },
      letterSpacing: {
        luxury: "0.25em",
        micro: "0.35em",
      },
      colors: {
        ivory: "#FAF8F5",
        cream: "#F0EBE0",
        gold: "#C9A96E",
        charcoal: "#1A1A1A",
        gray: "#6B6B6B",
        blush: "#F5E6E0",
        sage: "#E8EDE8",
      },
      backdropBlur: {
        luxury: "20px",
      },
      transitionDuration: {
        luxury: "500ms",
      },
    },
  },
};

export default config;
