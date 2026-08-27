import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        goji: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          500: '#0066CC', // Primary Logo Blue
          600: '#0055B3',
          700: '#004499',
          900: '#002B66',
          red: '#F23838', // Logo Accent Red
          redHover: '#D62222',
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
