import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// IMPORTANT: change `base` below to "/<your-repo-name>/" for GitHub Pages deployment
// Example: if repo is github.com/jane/deepnote -> base: "/deepnote/"
export default defineConfig({
  plugins: [react()],
  base: '/deepnote/',
  build: {
    // Split vendor code into separate chunks for better browser caching.
    rollupOptions: {
      output: {
        manualChunks: {
          react:    ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          dnd:      ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
        },
      },
    },
  },
})
