import type { NextConfig } from "next";
import { join } from "path";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  outputFileTracingRoot: join(__dirname, "..", "..")
};

export default nextConfig;
