import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Any request to /webhook will be forwarded to your n8n Render instance
      // The browser thinks it's communicating with localhost, so CORS won't block it!
      '/webhook': {
        target: 'https://n8n-test-q9yh.onrender.com',
        changeOrigin: true,
        secure: false, // In case n8n has SSL issues
      }
    }
  }
})
