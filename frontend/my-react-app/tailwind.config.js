/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brandDark: "#2E3844",   // large headings
        brandMuted: "#7E8287",  // small headers
      },
      fontFamily: {
        lato: ["Lato", "sans-serif"],
        urbanist: ["Lato", "sans-serif"],
        marcellus: ["Lato", "sans-serif"],
      },
    },
  },
  plugins: [],
};
