import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  optimizeDeps: {
    include: [
      'bootstrap', 
      '@popperjs/core',
      'react-icons/fi',
      'react-icons/ai',
      'react-icons/bs',
      // Add any other react-icons subsets you're using
    ]
  },
  build: {
    rollupOptions: {
      external: [
        // No need to externalize react-icons since we're including them in optimizeDeps
      ],
      output: {
        manualChunks: {
          // Optional: Create separate chunks for better caching
          react: ['react', 'react-dom'],
          icons: ['react-icons']
        }
      }
    },
    commonjsOptions: {
      include: [/node_modules/]
    }
  }
})
