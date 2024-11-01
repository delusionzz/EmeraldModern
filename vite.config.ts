import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { baremuxPath } from "@mercuryworkshop/bare-mux/node";
import { libcurlPath } from "@mercuryworkshop/libcurl-transport";
//@ts-ignore
import { epoxyPath } from "@mercuryworkshop/epoxy-transport";
import { uvPath } from "@titaniumnetwork-dev/ultraviolet";

import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    TanStackRouterVite(),
    viteStaticCopy({
      targets: [
        {
          src: `${uvPath}/**/*`.replace(/\\/g, "/"),
          dest: "uv",
          overwrite: false,
        },
        {
          src: `${baremuxPath}/**/*`.replace(/\\/g, "/"),
          dest: "baremux",
          overwrite: false,
        },
        {
          src: `${libcurlPath}/**/*`.replace(/\\/g, "/"),
          dest: "libcurl",
          overwrite: false,
        },
        {
          src: `${epoxyPath}/**/*`.replace(/\\/g, "/"),
          dest: "epoxy",
          overwrite: false,
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api/": {
        target: "http://localhosT:3000/",
      },
      "/w/": {
        target: "http://localhosT:4000/",
        rewrite: (p) => p.replace(/^\/w/, ""),
        ws: true,
      },
    },
  },
});
