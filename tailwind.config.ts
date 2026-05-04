import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f7f7f8",
          100: "#eeeef0",
          200: "#d6d6db",
          300: "#b3b3bb",
          400: "#7e7e8a",
          500: "#535362",
          700: "#2c2c38",
          900: "#0f0f17",
        },
      },
    },
  },
  plugins: [],
};

export default config;
