import type { MDXComponents } from "mdx/types";

// Post typography comes from <Prose>; no element overrides are needed.
const components: MDXComponents = {};

export function useMDXComponents(): MDXComponents {
  return components;
}
