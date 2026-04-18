export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cormorant', 'Georgia', 'serif'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        parchment: '#F5EED8',
        surface: '#FAF6EC',
        forest: {
          DEFAULT: '#1C2B1A',
          light: '#243621',
          muted: '#3D5A3A',
        },
        terra: {
          DEFAULT: '#C4592A',
          50: '#FDF0E8',
          100: '#F5D9C8',
          200: '#EBB898',
          dark: '#A84420',
        },
        sage: {
          DEFAULT: '#4A7A5C',
          50: '#EEF4F1',
          100: '#D4E7DB',
          dark: '#3D6449',
        },
        ink: '#1A1208',
        muted: '#8B7D6B',
        'ink-light': '#B5A898',
        'warm-border': '#E2D5BE',
        'warm-border-dark': '#CFC0A8',
      },
      boxShadow: {
        'warm-sm': '0 1px 4px rgba(26,18,8,0.07), 0 0 0 1px rgba(226,213,190,0.6)',
        'warm-md': '0 4px 20px rgba(26,18,8,0.10), 0 0 0 1px rgba(226,213,190,0.4)',
        'warm-lg': '0 12px 40px rgba(26,18,8,0.14)',
      },
    },
  },
  plugins: [],
};
