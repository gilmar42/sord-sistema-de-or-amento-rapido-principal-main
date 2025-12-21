import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProd = mode === 'production';

    return {
      root: 'src',
      server: {
        port: 3000,
        host: '0.0.0.0',
        strictPort: false,
      },
      plugins: [
        react(),
        tailwindcss(),
      ],
      clearScreen: false,
      build: {
        target: 'es2020',
        minify: 'terser',
        cssMinify: true,
          outDir: '../dist',
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              utils: ['uuid'],
            },
            compact: true,
          },
        },
        sourcemap: !isProd,
        chunkSizeWarningLimit: 500,
        reportCompressedSize: false,
      },
      define: {
        'process.env.NODE_ENV': JSON.stringify(mode),
      },
      resolve: {
        alias: {
            // Map '@' to the project src directory without relying on __dirname (ESM safe)
            '@': path.resolve(process.cwd(), 'src'),
        }
      }
    };
});
