import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In dev, proxy API + uploads to the Go backend so the SPA can use
// same-origin relative URLs (no CORS needed). In production the Go
// binary serves the built SPA, so these paths are same-origin anyway.
export default defineConfig({
  plugins: [react()],
  server: {
    // Honor an assigned PORT (e.g. from the preview tool); fall back to 5173.
    port: Number(process.env.PORT) || 5173,
    proxy: {
      '/api': { target: 'http://localhost:8090', changeOrigin: true },
      '/uploads': { target: 'http://localhost:8090', changeOrigin: true },
    },
  },
})
