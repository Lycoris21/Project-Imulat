import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss({
      config: {
        content: [
          "./src/**/*.{js,jsx,ts,tsx}",
          "./public/index.html"
        ],
        theme: {
          extend: {
            colors: {
              primary: '#4B548B',
              secondary: '#F3F4F6',
              accent: '#2563EB',
            },
          },
        },
      }
    })],
})
