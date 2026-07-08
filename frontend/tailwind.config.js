/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0B0F14",
          900: "#0F151C",
          800: "#161E27",
          700: "#202B37",
          600: "#334154",
        },
        parchment: "#EFE9DC",
        brass: {
          400: "#D4A65A",
          500: "#BE8A3D",
          600: "#9C6F2E",
        },
        verdigris: {
          300: "#7BBEA7",
          400: "#5FA88F",
          500: "#3E8770",
        },
        rust: "#C1543A",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Space Grotesk", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "seal-radial":
          "radial-gradient(circle at 50% 50%, rgba(212,166,90,0.18) 0%, rgba(212,166,90,0) 70%)",
      },
      boxShadow: {
        vault: "0 1px 0 0 rgba(212,166,90,0.15), 0 20px 40px -20px rgba(0,0,0,0.6)",
      },
    },
  },
  plugins: [],
};
