/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom Sellify Color Palette
        'sellify': {
          'primary': '#F7E9A0',     // 🌼 Primary - kuning muda lembut
          'secondary': '#E9C46A',   // 🍯 Secondary - versi lebih tua
          'background': '#FFFCF2',  // ☁️ Background - putih hangat
          'text': '#3E3E3E',        // 🖋 Text - abu kehitaman
          'accent': '#FFD56B',      // 🍋 Accent - untuk hover/highlight
        }
      },
    },
  },
  plugins: [],
}