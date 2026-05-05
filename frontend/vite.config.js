import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: '/uppskriftapunktar/',
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': 'http://localhost:8080',
      },
    },
    resolve: {
      alias: env.VITE_USE_MOCK === 'true'
        ? [
            // Redirect any relative import of 'api' (../api, ../../api, ./api) to the mock
            {
              find: /^(\.\.?\/)+api$/,
              replacement: resolve(__dirname, 'src/api.mock.js'),
            },
          ]
        : [],
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/setupTests.js',
    },
  }
})
