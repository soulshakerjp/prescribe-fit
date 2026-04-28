import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        rx: {
          ink: '#0f172a',
          paper: '#f8fafc',
          cyan: '#0891b2',
          mint: '#ccfbf1',
          soft: '#ecfeff',
          stamp: '#dc2626',
          line: '#cbd5e1'
        }
      },
      boxShadow: {
        rx: '0 20px 60px rgba(15, 23, 42, 0.08)'
      },
      backgroundImage: {
        grid: 'linear-gradient(to right, rgba(8,145,178,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(8,145,178,0.06) 1px, transparent 1px)'
      }
    }
  },
  plugins: []
};

export default config;
