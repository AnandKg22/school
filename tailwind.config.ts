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
        brand: {
          blue: "#2563EB",
          navy: "#0F172A",
          green: "#10B981",
          cyan: "#06B6D4",
          soft: "#F8FAFC",
          border: "#E2E8F0",
          body: "#475569",
          gray: "#64748B",
          lightblue: "#DBEAFE",
          lightgreen: "#D1FAE5",
          skyblue: "#38BDF8",
          indigo: "#4F46E5",
        },
        school: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#2563EB",
          600: "#1D4ED8",
          700: "#1E40AF",
          800: "#1E3A8A",
          900: "#172554",
        },
      },
      backgroundImage: {
        'brand-gradient': "linear-gradient(135deg, #0057FF 0%, #00C48C 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
