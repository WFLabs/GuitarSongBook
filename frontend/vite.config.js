import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/songs': 'http://localhost:8000',
      '/youtube': 'http://localhost:8000',
      '/pdf': 'http://localhost:8000',
      '/media': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
      '/launch-terminal': 'http://localhost:8000',
      '/tabs': 'http://localhost:8000',
      '/lyrics': 'http://localhost:8000',
      '/playlists': 'http://localhost:8000',
    }
  }
})
