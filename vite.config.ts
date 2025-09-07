import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      server: {
        host: true,
        port: parseInt(process.env.PORT || '5173'),
      },
      preview: {
        host: true,
        port: parseInt(process.env.PORT || '4173'),
        allowedHosts: [
          'localhost',
          'healthcheck.railway.app',
          '.railway.app',
          '.up.railway.app'
        ]
      }
    };
});
