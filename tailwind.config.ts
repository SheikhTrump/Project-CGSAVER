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
      colors: {
        background: '#FAFAF9',
        surface: '#FFFFFF',
        'surface-2': '#F1F5F9',
        border: '#E2E8F0',
        'text-primary': '#0F172A',
        'text-secondary': '#475569',
        'text-muted': '#94A3B8',
        accent: {
          DEFAULT: '#F97316',
          hover: '#EA6C00',
          light: '#FFF7ED',
        },
        sidebar: {
          bg: '#0F172A',
          text: '#CBD5E1',
          active: '#F97316',
          hover: '#1E293B',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
        card: "rgb(var(--card))",
        primary: {
          DEFAULT: "rgb(var(--primary))",
          foreground: "rgb(var(--primary-foreground))",
        },
        foreground: "rgb(var(--foreground))",
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
        pill: '999px',
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        modal: '0 10px 40px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
