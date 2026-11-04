/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./sidepanel.html", "./welcome.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        savvy: {
          blue: "#398CF5",
          purple: "#7045ED",
          green: "#12C98A",
          red: "#EF5350",
          navy: "#171B3D",
          "soft-blue": "#EAF3FF",
          "soft-purple": "#F0EBFF",
          "soft-green": "#E5FAF1",
          "soft-red": "#FDECEC",
          "light-gray": "#F5F7FA",
        },
        brand: {
          50: "#EAF3FF",
          100: "#dbeafe",
          500: "#398CF5",
          600: "#398CF5",
          700: "#7045ED",
        },
      },
      backgroundImage: {
        "savvy-gradient": "linear-gradient(110deg, #35B8F5 0%, #398CF5 48%, #7045ED 100%)",
      },
    },
  },
  plugins: [],
};
