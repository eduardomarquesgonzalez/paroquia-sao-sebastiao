import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      fontFamily: {
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
      },

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
          background: "#F5F2EC",
          surface: "#FFFFFF",

          primary: "#E8E4DA",
          secondary: "#8A9AAF",

          navy: {
            light: "#2A4A7F",
            DEFAULT: "#1A3258",
            dark: "#0D1B3E",
          },

          gold: {
            light: "#E0C97A",
            DEFAULT: "#C9A84C",
            dark: "#A88A3A",
          },

          sky: {
            light: "#D6E4F2",
            DEFAULT: "#9FB9D9",
            dark: "#6F8FB3",
          },

          text: {
            light: "#6B7A8A",
            DEFAULT: "#1E2D40",
            dark: "#0D1B3E",
          },

          border: "#E2DBD0",
        },
      },

      backgroundImage: {
        "gradient-parish":
          "linear-gradient(135deg, #F5F2EC 0%, #E8E4DA 50%, #C9A84C15 100%)",

        "gradient-gold":
          "linear-gradient(135deg, #E0C97A 0%, #C9A84C 50%, #A88A3A 100%)",

        "gradient-navy":
          "linear-gradient(135deg, #2A4A7F 0%, #1A3258 50%, #0D1B3E 100%)",

        "gradient-sky": "linear-gradient(135deg, #D6E4F2 0%, #9FB9D9 100%)",

        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",

        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },

      boxShadow: {
        parish: "0 4px 24px rgba(13, 27, 62, 0.07)",
        gold: "0 4px 20px rgba(201, 168, 76, 0.35)",
        navy: "0 8px 40px rgba(13, 27, 62, 0.18)",
        glass: "0 8px 32px rgba(13, 27, 62, 0.08)",
      },

      borderRadius: {
        parish: "1.5rem",
      },

      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(28px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },

      animation: {
        "fade-up": "fadeUp 0.7s ease-out forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
      },
    },
  },

  plugins: [],
};

export default config;
