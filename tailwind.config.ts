import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: {
          50: "#faf8f5",
          100: "#f3eee8",
          200: "#e8e1da",
          300: "#d9cec2",
          400: "#c7b7a5",
          500: "#b9b0a8",
          600: "#9f948a",
          700: "#7e746b",
          800: "#5d554f",
          900: "#3f3a36",
        },

        parish: {
          background: "#F7F5F2",
          surface: "#FFFFFF",

          primary: "#E8E1DA",
          secondary: "#B9B0A8",

          gold: {
            light: "#D8BE84",
            DEFAULT: "#B89A5D",
            dark: "#9C7F46",
          },

          sky: {
            light: "#D6E4F2",
            DEFAULT: "#9FB9D9",
            dark: "#6F8FB3",
          },

          text: {
            light: "#7E746B",
            DEFAULT: "#3F3A36",
            dark: "#2B2724",
          },

          border: "#DDD6CF",
        },
      },

      backgroundImage: {
        "gradient-parish":
          "linear-gradient(135deg, #F7F5F2 0%, #E8E1DA 50%, #B9B0A8 100%)",

        "gradient-gold":
          "linear-gradient(135deg, #D8BE84 0%, #B89A5D 50%, #9C7F46 100%)",

        "gradient-sky": "linear-gradient(135deg, #D6E4F2 0%, #9FB9D9 100%)",

        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",

        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },

      boxShadow: {
        parish: "0 4px 20px rgba(63, 58, 54, 0.08)",
        gold: "0 4px 18px rgba(184, 154, 93, 0.25)",
      },

      borderRadius: {
        parish: "1.5rem",
      },
    },
  },

  plugins: [],
};

export default config;
