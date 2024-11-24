import createJiti from "jiti";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const jiti = createJiti(fileURLToPath(import.meta.url));

jiti("./src/env");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },

  webpack: (config, { isServer }) => {
    const path = fileURLToPath(new URL(".", import.meta.url));
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": resolve(path, "./src"),
      "@components": resolve(path, "./src/components"),
      "@lib": resolve(path, "./src/lib"),
    };

    if (!isServer) {
      // Don't bundle server-only modules on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        crypto: false,
        pg: false,
        'pg-native': false,
        'perf_hooks': false,
        stream: false,
      };
    }

    return config;
  },
};

export default nextConfig;
