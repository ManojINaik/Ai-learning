import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    define: {
      'process.env': env
    },
    server: {
      port: 3000,
      open: true,
      host: true,
      proxy: {
        '/api': {
          target: 'https://glhf.chat/api/openai/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          headers: {
            'Authorization': `Bearer ${env.VITE_GLHF_API_KEY}`
          }
        }
      }
    }
  };
});
