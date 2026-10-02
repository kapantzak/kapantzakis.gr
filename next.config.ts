import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

// MDX files are imported by lib/post-source.ts, not routed, so pageExtensions stays default.
const withMDX = createMDX({});

export default withMDX(nextConfig);
