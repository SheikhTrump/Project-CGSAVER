import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        // Warm-neutral, ink-on-paper palette. One ink colour does the work
        // an accent normally would; hue is reserved for status meaning.
        background: '#FAFAF9',
        surface: '#FFFFFF',
        'surface-2': '#F4F4F2',
        border: '#E7E5E2',
        'text-primary': '#1C1917',
        'text-secondary': '#57534E',
        'text-muted': '#78716C',
        accent: {
          DEFAULT: '#1C1917',
          hover: '#3A3633',
          light: '#F4F4F2',
        },
        sidebar: {
          bg: '#FAFAF9',
          text: '#57534E',
          active: '#1C1917',
          hover: '#EFEEEC',
        },
        success: '#3F7A4F',
        warning: '#A16207',
        danger: '#B42318',
        info: '#57534E',
        card: "var(--card)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        foreground: "var(--foreground)",
      },
      borderRadius: {
        card: '10px',
        btn: '6px',
        pill: '999px',
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card: 'none',
        modal: '0 8px 24px rgba(28,25,23,0.08)',
      },
      letterSpacing: {
        tightest: '-0.035em',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
