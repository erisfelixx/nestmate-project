import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // Імітує браузер у терміналі
    globals: true,        // Дозволяє використовувати describe/it/expect без імпортів
    setupFiles: './src/setupTests.js',
  }
})
