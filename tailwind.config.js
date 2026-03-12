/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        tajawal: ['Tajawal_400Regular', 'sans-serif'],
        tajawalMedium: ['Tajawal_500Medium', 'sans-serif'],
        tajawalBold: ['Tajawal_700Bold', 'sans-serif'],
        tajawalExtraBold: ['Tajawal_800ExtraBold', 'sans-serif'],
      },
      colors: {
        aramadan: {
          green: "#2E7D32",
          beige: "#F9F5F0",
          gold: "#FFD700",
          white: "#FFFFFF",
          textMain: "#333333",
          textLight: "#666666"
        }
      },
    },
  },
  plugins: [],
};
