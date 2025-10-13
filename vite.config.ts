import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    allowedHosts: [
      '.ngrok-free.dev' // Allows all ngrok-free.dev subdomains
    ],
    port: 3000,
    host: true,
  }
})