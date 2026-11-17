import path from 'path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Playwright writes HTML reports here. Watching them makes the dev server
    // reload any open page, including one an e2e test is driving.
    watch: {
      ignored: ['**/playwright-report/**', '**/test-results/**', '**/blob-report/**'],
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
    // Unit tests live beside the code in src/. The Playwright specs in e2e/ need a
    // running stack and their own runner, so Vitest must never collect them.
    include: ['src/**/*.test.{js,jsx}'],
    exclude: ['node_modules/**', 'dist/**', 'e2e/**'],
  },
})
