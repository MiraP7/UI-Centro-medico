import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redirige las peticiones que comienzan con /api al backend de .NET
      '/api': {
        target: 'http://localhost:5000', // <-- USA EL PUERTO DE TU BACKEND .NET
        changeOrigin: true,
        secure: false,      
      }
    }
  }
})
