/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/**/*.{html,js,svelte,ts}'
  ],
  theme: {
    extend: {
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      colors: {
        // Custom colors for chat portal
        'chat-bg': '#f8fafc',
        'chat-sidebar': '#ffffff',
        'chat-message-user': '#3b82f6',
        'chat-message-agent': '#f1f5f9',
        'chat-border': '#e2e8f0',
      }
    }
  },
  plugins: []
};
