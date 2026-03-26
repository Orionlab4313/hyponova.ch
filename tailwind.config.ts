import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "#c8553d",
        "accent-hover": "#b44a35",
      },
      maxWidth: {
        site: "1400px",
      },
    },
  },
  plugins: [],
};
export default config;
