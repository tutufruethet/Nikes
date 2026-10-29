import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base relativa: o build funciona na raiz da Vercel e dentro de um artefato
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { chunkSizeWarningLimit: 1600 },
});
