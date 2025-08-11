/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#d9ecff",
          200: "#b8dbff",
          300: "#8bc4ff",
          400: "#58a6ff",
          500: "#2f8bff",
          600: "#1e6fe0",
          700: "#1959b5",
          800: "#174a93",
          900: "#143d79"
        }
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(0,0,0,0.2)"
      }
    }
  },
  plugins: []
};
