/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./templates/**/*.html",
    "./static/**/*.js",
  ],
  theme: {
    extend: {
      // Hebrew/RTL specific extensions
      fontFamily: {
        'hebrew': ['Arial', 'David', 'Times New Roman', 'serif'],
      },
      spacing: {
        'rtl': '0.25rem',
      }
    },
  },
  plugins: [],
} 