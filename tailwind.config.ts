import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // New Mobile App Design System
        background: {
          primary: '#0f0f0f',
          secondary: '#1a1a1a',
          elevated: '#252525',
        },
        primary: {
          DEFAULT: '#2A32EB',
          dark: '#5B61EF',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#999999',
        },
        border: {
          subtle: '#2a2a2a',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        'xs': '11px',
        'sm': '13px',
        'base': '15px',
        'lg': '17px',
        'xl': '20px',
        '2xl': '28px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        'full': '9999px',
      },
      backgroundImage: {
        'gradient-overlay': 'linear-gradient(transparent, rgba(0,0,0,0.8))',
      },
    },
  },
  plugins: [],
}
export default config
