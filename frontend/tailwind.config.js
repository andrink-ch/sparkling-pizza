export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'system-ui', 'sans-serif'],
        sans:    ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg:      '#F3F4F6',
        surface: '#FFFFFF',
        border: {
          DEFAULT: '#E4E4E7',
          strong:  '#D1D1D6',
        },
        ink: {
          DEFAULT: '#09090B',
          2: '#3F3F46',
          3: '#71717A',
          4: '#A1A1AA',
        },
        accent: {
          DEFAULT: '#FF5500',
          dark:    '#E04800',
          bg:      '#FFF3EE',
          border:  '#FFD0B8',
        },
        ok: {
          DEFAULT: '#16A34A',
          bg:      '#F0FDF4',
          border:  '#BBF7D0',
        },
      },
      boxShadow: {
        card:       '0 1px 3px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.04)',
        'card-md':  '0 4px 16px rgba(0,0,0,0.09), 0 0 0 1px rgba(0,0,0,0.04)',
        modal:      '0 24px 64px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        DEFAULT: '10px',
      },
    },
  },
  plugins: [],
};
