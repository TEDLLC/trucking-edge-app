import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // 1. Specific proxy for FMCSA requests
      '/api/fmcsa': {
        target: 'https://mobile.fmcsa.dot.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fmcsa/, '/qc/services'),
      },
      // 2. General proxy for your local server.js backend
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})