import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'build',
    sourcemap: false, // Disable sourcemaps in production for smaller bundle size
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
    },
    minify: 'esbuild', // Use esbuild for minification (built into Vite)
    target: 'es2015', // Target modern browsers for better optimization
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  }
})