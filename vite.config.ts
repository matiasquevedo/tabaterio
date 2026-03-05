import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: true, // Importante para Docker
    watch: {
      // Dile a Vite que ignore la carpeta de datos de PocketBase
      ignored: ['**/pb_data/**'],
    },
    proxy: {
      // Cuando Vue pida algo que empiece por /api o /_, mándalo al contenedor
      '^/(api|_)/': {
        target: 'http://pocketbase:7878',
        changeOrigin: true,
      }
    }
  }
})
