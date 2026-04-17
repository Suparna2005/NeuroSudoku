import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: [
        '.',
        'C:/Users/supar/.gemini/antigravity/brain/c4e34718-af12-42d8-8725-dbc58b1b8e12'
      ]
    }
  }
})
