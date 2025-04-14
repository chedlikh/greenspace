import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-macros']
      }
    }),
    tailwindcss()
  ],
  optimizeDeps: {
    include: [
      'bootstrap',
      '@popperjs/core',
      'react-icons/fi',
      'react-icons/ai',
      'react-icons/bs',
      'react-icons',
      'date-fns'
    ],
    exclude: []
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/],
      exclude: []
    },
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-redux'],
          icons: ['react-icons'],
          datefns: ['date-fns']
        }
      }
    }
  },
  resolve: {
    alias: {
      // Add any necessary aliases here
    }
  }
})
