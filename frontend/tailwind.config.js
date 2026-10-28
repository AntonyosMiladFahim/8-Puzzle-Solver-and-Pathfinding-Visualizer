/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#E50914",
          hover: "#F01520",
          muted: "#A8383E",
        },
        secondary: {
          DEFAULT: "#000000",
        },
        neutral: {
          dark: "#141414",
        },
        surface: {
          DEFAULT: "#1A1A1E",
          elevated: "#24242A",
        },
      },
      keyframes: {
        traversed: {
          "0%": {
            transform: "scale(0.3)",
            backgroundColor: "rgba(229, 9, 20, 0.85)",
            borderRadius: "100%",
          },
          "35%": {
            backgroundColor: "rgba(139, 92, 246, 0.85)",
          },
          "70%": {
            transform: "scale(1.15)",
            backgroundColor: "rgba(14, 165, 233, 0.85)",
          },
          "100%": {
            transform: "scale(1)",
            backgroundColor: "#0284c7",
            borderRadius: "0px",
          },
        },
        path: {
          "0%": {
            transform: "scale(0.3)",
            backgroundColor: "#e50914",
            borderRadius: "100%",
          },
          "40%": {
            backgroundColor: "#f59e0b",
            transform: "scale(1.25)",
            boxShadow: "0 0 16px rgba(245, 158, 11, 0.85)",
          },
          "75%": {
            transform: "scale(0.92)",
            backgroundColor: "#fbbf24",
          },
          "100%": {
            transform: "scale(1)",
            backgroundColor: "#f59e0b",
            borderRadius: "2px",
          },
        },
        wall: {
          "0%": {
            transform: "scale(0.4)",
            opacity: "0.2",
            backgroundColor: "#141414",
          },
          "60%": {
            transform: "scale(1.08)",
            backgroundColor: "#35353d",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
            backgroundColor: "#242429",
          },
        },
      },
      animation: {
        traversed: "traversed 0.5s cubic-bezier(0, 0, 0.2, 1) forwards",
        path: "path 1.5s cubic-bezier(0, 0, 0.2, 1) forwards",
        wall: "wall 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards",
      },
    },
  },
  plugins: [],
};
