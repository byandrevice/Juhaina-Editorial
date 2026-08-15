import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eerzzdmiarfvzbuskddh.supabase.co",
        port: "",
        pathname: "/storage/v1/object/sign/editorial-images/**",
      },
    ],
  },
};

export default nextConfig;
