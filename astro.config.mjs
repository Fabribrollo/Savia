// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // OJO: dominio de prueba. Cambialo por el real antes de publicar.
  // De acá salen las URL absolutas de las metaetiquetas Open Graph: las
  // relativas no sirven, los scrapers de WhatsApp y Facebook las descartan.
  site: 'https://savia.com',

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