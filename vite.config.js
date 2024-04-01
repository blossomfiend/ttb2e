import path from "path";
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

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
    },
    build: {
        outDir: path.resolve(__dirname, "dist"),
        sourcemap: true,
        brotliSize: true,
        emptyOutDir: true,
        lib: {
            entry: path.resolve(__dirname, "src/ttb2e.js"),
            name: "system",
            formats: ["es"], // also supports "umd"
            fileName: (_format) => "ttb2e.js",
        },
        cssMinify: "lightningcss",
        cssCodeSplit: false,
    },
    plugins: [
        svelte({
            configFile: "../svelte.config.js", // relative to src/
        }),
    ],
});
