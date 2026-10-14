import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        school: {
          50: "#fdf8ee",
          100: "#f9eed4",
          200: "#f4dc9e",
          300: "#eec465",
          400: "#e7ac35",
          500: "#d98d1a",
          600: "#be6e13",
          700: "#984f13",
          800: "#7d3f16",
          900: "#683516",
        },
      },
    },
  },
  plugins: [],
};
export default config;
