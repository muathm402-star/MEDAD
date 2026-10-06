import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'preview-headers',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Content-Security-Policy', "frame-ancestors *")
          next()
        })
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Content-Security-Policy', "frame-ancestors *")
          next()
        })
      },
    },
  ],
  appType: 'spa',
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    cors: true,
    hmr: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
})
