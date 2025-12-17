/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#15803d",
        secondary: "#16a34a",
        accent: "#22c55e",
        surface: "#f0fdf4"
      },
      animation: {
        fade: "fadeIn 0.6s ease-in-out",
        slideUp: "slideUp 0.6s ease-out",
        float: "float 3s ease-in-out infinite"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 }
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 }
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" }
        }
      }
    }
  },
  plugins: [],
};
