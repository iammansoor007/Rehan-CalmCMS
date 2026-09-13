import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4E6E58",
          dark: "#3B5443",
          light: "#E7EFEA",
        },
        brand: {
          bgLight: "#F1F0EA",
          bgSoft: "#F8F7F3",
          accentBeige: "#CDAF95",
          accentBeigeLight: "#F6F1EC",
          dark: "#26322D",
          muted: "#66766D",
          border: "#E1DFD5",
          borderLight: "#ECEAE1",
        },
      },
      fontFamily: {
        heading: ["var(--font-poppins)", "Poppins", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "16px",
        lg: "24px",
      },
      boxShadow: {
        soft: "0 4px 12px rgba(38, 50, 45, 0.04)",
        card: "0 8px 24px rgba(38, 50, 45, 0.08)",
        floating: "0 16px 40px rgba(38, 50, 45, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
