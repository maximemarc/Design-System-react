import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Construction du paquet @maximemarc/forma (distinct de la vitrine, construite
 * par vite.config.ts). Sortie dans lib-dist/ :
 *   forma.js   module ES, React et lucide-react restent externes ;
 *   forma.css  toutes les feuilles importées par les modules publiés.
 * Les déclarations de types sont produites ensuite par tsconfig.lib.json.
 */
export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    outDir: 'lib-dist',
    emptyOutDir: true,
    sourcemap: true,
    cssCodeSplit: false,
    lib: {
      entry: 'src/lib/index.ts',
      formats: ['es'],
      fileName: () => 'forma.js',
      cssFileName: 'forma',
    },
    rolldownOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'lucide-react'],
    },
  },
});
