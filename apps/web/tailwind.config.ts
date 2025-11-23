import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#0000ff"
      },
      fontFamily: {
        satoshi: ["var(--font-satoshi)", "sans-serif"],
        "satoshi-regular": ["var(--font-satoshi-regular)", "var(--font-satoshi)", "sans-serif"],
        "satoshi-light": ["var(--font-satoshi-light-italic)", "var(--font-satoshi)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"]
      },
      letterSpacing: {
        brand: "-0.03em"
      }
    }
  },
  plugins: []
};

export default config;
