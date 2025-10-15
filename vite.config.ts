import { defineConfig } from 'vite';
import { angular } from '@analogjs/vite-plugin-angular';

export default defineConfig({
  plugins: [angular()],
  server: {
    port: 4300,
    host: true,
  },
  optimizeDeps: {
    exclude: ['@angular/platform-server'],
  },
  define: {
    global: 'globalThis',
  },
});
