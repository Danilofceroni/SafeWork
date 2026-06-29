import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.100.156', 'localhost'],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
