/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#10212e',
        mist: '#f5f7fb',
        ocean: '#1f6feb',
        coral: '#ef6f5e',
        leaf: '#0f9f6e',
        sun: '#f5b841'
      },
      boxShadow: {
        soft: '0 18px 50px rgba(16, 33, 46, 0.08)'
      },
      animation: {
        'fade-in': 'fadeIn 220ms ease-out both',
        'slide-up': 'slideUp 260ms ease-out both'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: []
};
