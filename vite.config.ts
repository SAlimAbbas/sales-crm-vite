import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    port: 3000,
    host: true,
  },
   build: {
    chunkSizeWarningLimit: 1000, // Increase limit to 1000 kB
  },
})