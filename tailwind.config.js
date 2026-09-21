/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx}',
    './index.{js,jsx}',
    './components/**/*.{js,jsx}',
    './screens/**/*.{js,jsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#FAFAFA',
        surface: '#F8F9FA',
        glass: 'rgba(255,255,255,0.86)',
        accent: '#BA4A0C',
        accentDark: '#FCEFE9',
        teal: '#006B63',
        muted: '#666666',
        ink: '#1A1A1A',
      },
      borderRadius: {
        glass: '22px',
      },
    },
  },
  plugins: [],
};
