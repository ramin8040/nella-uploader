import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fffaf4",
          100: "#ffeed9",
          200: "#ffd7ab",
          300: "#fbc286",
          400: "#f5a45b",
          500: "var(--primary-color, #e08d3c)",
          600: "#cb7223",
          700: "#a9541b",
          800: "#87411c",
          900: "#6d3519",
          peach: "#ffd7ab",
          accent: "var(--accent-color, #c96515)",
        },
        surface: {
          card: "rgba(255, 255, 255, 0.85)",
          cardBorder: "rgba(255, 255, 255, 0.6)",
          darkCard: "rgba(20, 24, 33, 0.75)",
          darkBorder: "rgba(255, 255, 255, 0.08)",
        },
      },
      fontFamily: {
        sans: ["var(--font-vazirmatn)", "Vazirmatn", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 20px 50px -10px rgba(0, 0, 0, 0.07), 0 10px 25px -5px rgba(0, 0, 0, 0.04)",
        glassHover: "0 25px 60px -10px rgba(224, 141, 60, 0.18), 0 15px 30px -5px rgba(0, 0, 0, 0.06)",
        card: "0 30px 60px -12px rgba(80, 50, 20, 0.08), 0 18px 36px -18px rgba(0, 0, 0, 0.06)",
        glow: "0 0 30px -5px var(--primary-color, #e08d3c)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "float-gentle": "float 6s ease-in-out infinite",
        "pulse-subtle": "pulseSubtle 3s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
