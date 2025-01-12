import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
    server: {
        port: 3000,
        strictPort: true,
        open: true,
        sourcemap: true,
        host: true,
    },
    build: {
        sourcemap: false,
        reportCompressedSize: true,
        chunkSizeWarningLimit: 1000,
        emptyOutDir: true,
        outDir: "./frontend-build",
        base: "/",
    },
    plugins: [react()],
});
