import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  // @ts-ignore
  allowedDevOrigins: [
    "192.168.1.11",
    "192.168.0.100",
    "localhost",
    "10.231.247.216",
    "iot.gopung.my.id",     // Cloudflare tunnel frontend
    "rdp.gopung.my.id",     // Cloudflare tunnel backend
    "100.73.183.83",
    "iot1.gopung.my.id",
  ],
};

export default nextConfig;
