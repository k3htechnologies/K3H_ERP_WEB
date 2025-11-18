import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    host: true,
  },

  // ✅ ADD THIS PART
  build: {
    sourcemap: false,     // ❌ Hides TSX, JSX, source files in production
    minify: 'esbuild',    // Faster & smaller bundle
    outDir: 'dist',       // Output folder
    assetsDir: 'assets',  // Assets folder
    rollupOptions: {
      output: {
        manualChunks: undefined,  // Keep bundle optimized
      },
    },
  },
})