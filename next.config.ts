import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // The old site's Projects section was folded into About.
    return [{ source: "/projects", destination: "/about", permanent: true }];
  },
};

// MDX files are imported by lib/post-source.ts, not routed, so pageExtensions stays default.
const withMDX = createMDX({});

export default withMDX(nextConfig);
