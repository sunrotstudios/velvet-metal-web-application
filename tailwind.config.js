/** @type {import('tailwindcss').Config} */
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        marquee: "marquee 25s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      fontFamily: {
        sans: ["Montreal", "system-ui", "sans-serif"],
        display: ["Montreal", "system-ui", "sans-serif"],
        mondwest: ["Mondwest", "system-ui", "sans-serif"],
        forevs: ["Forevs", "system-ui", "sans-serif"],
      },
      colors: {
        main: "var(--main)",
        overlay: "var(--overlay)",
        bg: "var(--bg)",
        bw: "var(--bw)",
        blank: "var(--blank)",
        text: "var(--text)",
        mtext: "var(--mtext)",
        border: "var(--border)",
        ring: "var(--ring)",
        ringOffset: "var(--ring-offset)",

        secondaryBlack: "#212121",
      },
      borderRadius: {
        base: "0px",
      },
      boxShadow: {
        shadow: "var(--shadow)",
      },
      translate: {
        boxShadowX: "6px",
        boxShadowY: "5px",
        reverseBoxShadowX: "-6px",
        reverseBoxShadowY: "-5px",
      },
      fontWeight: {
        base: "600",
        heading: "800",
      },
    },
  },
  plugins: [animate],
};
