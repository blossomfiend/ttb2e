import browserslistToEsbuild from "browserslist-to-esbuild";
import path from "path";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

// https://vitejs.dev/config/
export default defineConfig({
  root: "src/",
  publicDir: path.resolve(__dirname, "public"),
  base: "/systems/ttb2e/",
  server: {
    port: 30001,
    proxy: {
      "^(?!/systems/ttb2e)": "http://localhost:30000/",
      "/socket.io": {
        target: "ws://localhost:30000",
        ws: true,
      },
    },
  },
  css: {
    transformer: "postcss",
    modules: {
      localsConvention: "camelCaseOnly",
    },
  },
  build: {
    target: browserslistToEsbuild(),
    outDir: path.resolve(__dirname, "dist"),
    sourcemap: true,
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, "src/ttb2e.mjs"),
      formats: ["es"],
    },
    rollupOptions: {
      output: {
        entryFileNames: `[name].mjs`,
        chunkFileNames: `[name].[hash].mjs`,
      },
      preserveEntrySignatures: false,
    },
    cssMinify: "esbuild",
    cssCodeSplit: false,
  },
  esbuild: {
    keepNames: true,
  },
  plugins: [solidPlugin()],
});
