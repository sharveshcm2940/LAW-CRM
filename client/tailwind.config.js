/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        apertureBg: '#0A0A0B',
        apertureGridBg: '#0B0B0C',
        apertureCard: '#121214',
        apertureBorder: '#222225',
        apertureInputBorder: '#2A2A2E',
        apertureMuted: '#8E8E93',
        apertureDim: '#55555A',
        apertureWhite: '#FFFFFF',
      },
      backgroundImage: {
        'hairline-grid': "linear-gradient(to right, #161618 1px, transparent 1px), linear-gradient(to bottom, #161618 1px, transparent 1px)",
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
