/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tovybg: "#2196f3",
      },
    },
    backgroundImage: {
      infobg: "url('/tovybackground.svg')",
    },
  },
  plugins: [],
};
