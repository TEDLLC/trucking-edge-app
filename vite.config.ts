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
      '/api/fmcsa': {
        target: 'https://mobile.fmcsa.dot.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fmcsa/, '/qc/services'),
      },
    },
  },
})