export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'system-ui', 'sans-serif'],
        sans:    ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg:      '#09090B',
        surface: '#111113',
        surf2:   '#18191F',
        border: {
          DEFAULT: '#1F2028',
          strong:  '#2C2E3A',
        },
        ink: {
          DEFAULT: '#F0F4F8',
          2:       '#8B9AB0',
          3:       '#4A5568',
          4:       '#2D3748',
        },
        accent: {
          DEFAULT: '#FF5500',
          dark:    '#E04800',
          bg:      '#1E0E00',
          border:  '#3D1E00',
        },
        ok: {
          DEFAULT: '#22C55E',
          bg:      '#052E16',
          border:  '#14532D',
        },
      },
      boxShadow: {
        card:      '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
        'card-md': '0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,85,0,0.2)',
        modal:     '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07)',
      },
    },
  },
  plugins: [],
};
