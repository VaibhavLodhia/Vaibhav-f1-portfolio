import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  // Base path for GitHub Pages
  // Repository name: Vaibhav-f1-portfolio
  base: process.env.NODE_ENV === 'production' ? '/Vaibhav-f1-portfolio/' : '/',
})



