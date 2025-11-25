import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5000,
    proxy: {
      // Proxy /api to Backend (stripping /api prefix)
      // Usage: /api/auth/login -> http://localhost:5678/auth/login
      // Usage: /api/api/posts -> http://localhost:5678/api/posts
      '/api': {
        target: 'http://localhost:5678',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
