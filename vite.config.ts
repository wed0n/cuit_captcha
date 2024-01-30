import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [nodePolyfills()],
  server: {
    host: true,
    port: 8090,
  },
  build:{
    outDir:"vite_dist"
  }
})
