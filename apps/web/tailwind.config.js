/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FF9A40", // light accent / links
          500: "#F38321", // logo orange
          600: "#E07010", // primary buttons
          700: "#C45F0C", // pressed
          800: "#9A4A0A",
          900: "#7C3A08",
        },
        charcoal: {
          DEFAULT: "#36373B", // logo banner
          dark: "#1C1D20",
          deeper: "#121314",
          card: "#2A2B2F",
        },
      },
    },
  },
  plugins: [],
};
