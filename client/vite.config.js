import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = (
    env.BACK_API_URL ||
    env.VITE_API_URL ||
    process.env.BACK_API_URL ||
    process.env.VITE_API_URL ||
    ''
  ).trim();

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.BACK_API_URL': JSON.stringify(apiUrl),
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true
        }
      }
    }
  };
});
