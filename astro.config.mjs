// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  server: {
    port: 4321,
    host: true,
  },
  // Astro corre sobre Vite: acá va cualquier ajuste de Vite.
  vite: {
    ssr: {
      // GSAP se distribuye como ESM; evitamos que se externalice en SSR.
      noExternal: ['gsap'],
    },

    plugins: [tailwindcss()],
  },
});