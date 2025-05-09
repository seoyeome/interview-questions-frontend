import type { Config } from 'tailwindcss';

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
        primary: '#3182F6',
        secondary: '#00C7B4',
        'dark-bg': '#111827',
        'dark-card': '#1F2937',
        'dark-text': '#F9FAFB',
        'dark-muted': '#9CA3AF',
        'dark-border': '#374151',
      },
      fontFamily: {
        sans: ['Pretendard', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config; 