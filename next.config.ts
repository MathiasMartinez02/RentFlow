import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "images.unsplash.com" },
      { hostname: "avatars.githubusercontent.com" },
      { hostname: "ui-avatars.com" },
      // Agregado: host de NEXT_PUBLIC_WS_URL (http://localhost:3000) para servir las fotos públicas
      { hostname: "localhost" },
    ],
  },
};

export default nextConfig;
