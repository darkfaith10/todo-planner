import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // While running `vite dev` locally, proxy /api to `vercel dev`
    // (run `vercel dev` in a second terminal on port 3000) so the
    // frontend can talk to the serverless functions without CORS setup.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
