import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.PORT || 3023}`,
        changeOrigin: true
      },
      '/socket.io': {
        target: `http://localhost:${process.env.PORT || 3023}`,
        changeOrigin: true,
        ws: true
      }
    }
  }
});
