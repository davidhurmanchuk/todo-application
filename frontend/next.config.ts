import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // enables Docker minimal image
};

export default nextConfig;
