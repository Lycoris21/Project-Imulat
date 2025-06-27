import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:5050' // or whatever your backend runs on
    }
  },
  plugins: [
    react(),
    tailwindcss()],
})
