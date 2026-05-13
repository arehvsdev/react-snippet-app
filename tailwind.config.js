/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neutral-primary': '#ffffff',
        'neutral-secondary': '#f3f4f6',
        'neutral-secondary-soft': '#f9fafb',
        'neutral-tertiary': '#e5e7eb',
        'default': '#d1d5db',
        'heading': '#111827',
        'body': '#6b7280',
        'brand': '#3b82f6',
        'fg-brand': '#1e40af',
      },
      borderRadius: {
        'base': '0.375rem',
      },
    },
  },
  plugins: [],
}