import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// IMPORTANT: change `base` below to "/<your-repo-name>/" for GitHub Pages deployment
// Example: if repo is github.com/jane/deepnote -> base: "/deepnote/"
export default defineConfig({
  plugins: [react()],
  base: '/deepnote/',
})
