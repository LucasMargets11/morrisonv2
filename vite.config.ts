import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunk
          if (id.includes('node_modules')) {
            if (id.includes('react-big-calendar') || id.includes('date-fns')) {
              return 'vendor-calendar';
            }
            if (id.includes('@tanstack') || id.includes('axios')) {
              return 'vendor-data';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            return 'vendor';
          }
          // Admin app code
          if (id.includes('/src/pages/admin/') || id.includes('\\src\\pages\\admin\\') ||
              id.includes('/src/components/admin/') || id.includes('\\src\\components\\admin\\') ||
              id.includes('/src/lib/admin') || id.includes('\\src\\lib\\admin')) {
            return 'admin';
          }
        },
      },
    },
  },
});
