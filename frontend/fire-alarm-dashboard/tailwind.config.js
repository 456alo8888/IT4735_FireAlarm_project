/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#4f46e5",
        "background-dark": "#111827",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      // Optimize for production by enabling just-in-time mode improvements
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
  // Remove unused CSS in production for smaller bundle size
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
  },
}
