import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        goji: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          900: '#064e3b',
        },
        dark: {
          bg: '#0B0F17',
          card: '#131B2E',
          cardHover: '#1B2640',
          border: '#23304D',
          muted: '#8E9BAE',
        }
      },
    },
  },
  plugins: [],
};
export default config;
