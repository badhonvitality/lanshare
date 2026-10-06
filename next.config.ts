import type { NextConfig } from "next";
import { networkInterfaces } from "os";

// Get local IPs
function getLocalIps() {
  const ips = [];
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4;
      if (net.family === familyV4Value && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  return ips;
}

const nextConfig: NextConfig = {
  // Allow WebSockets / HMR from local network IPs
  // @ts-ignore
  allowedDevOrigins: getLocalIps(),
};

export default nextConfig;
