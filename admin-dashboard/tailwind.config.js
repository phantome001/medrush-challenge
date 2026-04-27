/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        medblue: "#2563eb",
        medgreen: "#10b981"
      }
    }
  },
  plugins: []
};
