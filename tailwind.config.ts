import type {Config} from "tailwindcss";
import plugin from "tailwindcss/plugin";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./src/**/*.{html,js,svelte,ts,jsx,tsx}"],
  darkMode: ["selector", ".theme-dark"],
  theme: {
    fontFamily: {
      body: "--font-body",
      mono: "--font-mono",
      awesome: "--font-awesome",
      modesto: ['"Modesto Condensed"'],
      amiri: ["Amiri"],
      signika: ["Signika"],
      "bruno-ace": ['"Bruno Ace"'],
      "bruno-ace-sc": ['"Bruno Ace SC"'],
    },
    extend: {
      fontSize: {
        "2xs": ["0.625rem", "0.875rem"],
      },
      backgroundImage: {},
      boxShadow: {},
      colors: {
        theme: "var(--ttb-color-theme)",
        "theme-lighter": "var(--ttb-color-theme-lighter)",
        "theme-light": "var(--ttb-color-theme-light)",
        "theme-dark": "var(--ttb-color-theme-dark)",
        "theme-darker": "var(--ttb-color-theme-darker)",
        // for whenever firefox is done implementing relative colors
        // "theme-lighter":
        //   "oklch(from var(--char-theme-color) calc(0.7 + 0.2 * l) calc(c * 0.5) h)",
        // "theme-light":
        //   "oklch(from var(--char-theme-color) calc(0.57 + 0.23 * l) calc(c * 0.9) h)",
        // "theme-dark":
        //   "oklch(from var(--char-theme-color) calc(0.25 + 0.3 * l) calc(c * 0.8) h)",
        // "theme-darker":
        //   "oklch(from var(--char-theme-color) calc(0.18 + 0.25 * l) calc(c * 0.4) h)",
      },
      transitionTimingFunction: {
        "fast-in": "cubic-bezier(.2,.8,0,1)",
      },
    },
  },
  plugins: [
    typography,
    plugin(function ({ addUtilities, matchUtilities, theme }) {
      addUtilities({
        ".text-shadow-none": {
          "text-shadow": "none",
        },
        ".small-caps": {
          "font-variant": "small-caps",
        },
      });
      matchUtilities(
        {
          "text-shadow": (value) => ({
            "text-shadow": `0 0 8px ${value}`,
          }),
          scrollbar: (value) => ({
            "scrollbar-color": `${value} transparent`,
          }),
        },
        {
          values: theme("colors"),
        },
      );
    }),
  ],
};

export default config;
