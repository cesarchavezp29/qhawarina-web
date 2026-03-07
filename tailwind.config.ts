import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette
        terra: {
          DEFAULT: "#C65D3E",
          50:  "#fdf3f0",
          100: "#fae3da",
          200: "#f4c4b0",
          300: "#ec9d80",
          400: "#e07050",
          500: "#C65D3E",
          600: "#a84830",
          700: "#8a3725",
          800: "#6e2b1d",
          900: "#5a2318",
        },
        charcoal: {
          DEFAULT: "#2D3142",
          light: "#4a5068",
          dark:  "#1e2130",
        },
        warm: {
          white: "#FAF8F4",
          50:    "#FAF8F4",
          100:   "#F3F0EA",
        },
        // Semantic colors
        positive: "#2A9D8F",   // teal — up trends, good news
        negative: "#9B2226",   // deep red — down trends, risk
        neutral:  "#8D99AE",   // grey — official data lines (INEI/BCRP)
        alert:    "#E0A458",   // amber — warnings, elevated zones
        // Legacy (keep for backward compat)
        qhawarina: {
          blue:   "#1E40AF",
          green:  "#059669",
          red:    "#DC2626",
          yellow: "#F59E0B",
        },
      },
      fontFamily: {
        serif:     ["DM Serif Display", "Georgia", "serif"],
        outfit:    ["Outfit", "system-ui", "sans-serif"],
        sans:      ["Source Sans 3", "system-ui", "sans-serif"],
        mono:      ["DM Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        "kpi-sm": ["2.5rem",  { lineHeight: "1", fontWeight: "700" }],
        "kpi":    ["3.5rem",  { lineHeight: "1", fontWeight: "700" }],
        "kpi-lg": ["4.5rem",  { lineHeight: "1", fontWeight: "700" }],
      },
    },
  },
  plugins: [],
};
export default config;
