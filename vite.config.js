import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages publica el sitio en https://<usuario>.github.io/<repositorio>/
  // "base" le dice a Vite que todos los archivos (JS, CSS, imágenes) cuelgan de esa subcarpeta.
  base: '/jardin-sullivan-demo/',
})
