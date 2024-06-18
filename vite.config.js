import browserslistToEsbuild from "browserslist-to-esbuild";
import path from "path";
import { defineConfig } from "vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import solidPlugin from "vite-plugin-solid";

// https://vitejs.dev/config/
export default defineConfig({
  root: "src/",
  publicDir: path.resolve(__dirname, "public"),
  base: "/systems/ttb2e/",
  server: {
    port: 30001,
    // this is proxying a local foundry server running on port 30000
    proxy: {
      // all requests that are not for this system go to foundry
      "^(?!/systems/ttb2e)": "http://localhost:30000/",
      // special handling for the websocket connection
      "/socket.io": {
        target: "ws://localhost:30000",
        ws: true,
      },
    },
  },
  build: {
    // target config is in package.json browserslist
    target: browserslistToEsbuild(),
    outDir: path.resolve(__dirname, "dist"),
    sourcemap: true,
    emptyOutDir: true,
    lib: {
      // this must match the entry in public/system.json
      entry: path.resolve(__dirname, "src/ttb2e.mjs"),
      formats: ["es"],
    },
    rollupOptions: {
      output: {
        // according to https://web.dev/learn/performance/code-split-javascript#dont_inadvertently_disable_streaming_compilation
        // v8 disables streaming compilation for es modules if they don't have the .mjs extension
        entryFileNames: `[name].mjs`,
        chunkFileNames: `[name].[hash].mjs`,
      },
      // we are not actually compiling a library, we just care about side effects
      preserveEntrySignatures: false,
    },
    cssMinify: "lightningcss",
    cssCodeSplit: false,
  },
  esbuild: {
    // essential for Foundries hooks to work correctly, they rely on class names
    keepNames: true,
  },
  plugins: [solidPlugin(), ViteImageOptimizer({})],
});
