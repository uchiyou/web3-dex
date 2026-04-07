/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Binance Web3 DEX palette
        binance: {
          gold: '#F0B90B',
          bg: '#0B0E11',
          card: '#1E2026',
          border: '#2A2E39',
          text: '#EAECEF',
          'text-muted': '#848E9C',
          buy: '#0ECB3B',
          sell: '#F6465D',
        },
        // Aliases for compatibility
        primary: {
          DEFAULT: '#F0B90B',
          50: '#FEF9E6',
          100: '#FDF3CC',
          200: '#FBE799',
          300: '#F9DB66',
          400: '#F7CF33',
          500: '#F0B90B',
          600: '#C09409',
          700: '#907007',
          800: '#604C05',
          900: '#302802',
        },
        dark: {
          bg: '#0B0E11',
          card: '#1E2026',
          border: '#2A2E39',
          100: '#2A2E39',
          200: '#1E2026',
          300: '#181A1F',
          400: '#0B0E11',
          500: '#0f1115',
        },
        buy: '#0ECB3B',
        sell: '#F6465D',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': "url('/images/hero-pattern.svg')",
      }
    },
  },
  plugins: [],
}
