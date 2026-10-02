import { readdir } from "node:fs/promises";
import path from "node:path";
import type { ComponentType } from "react";
import { externalPosts } from "@/content/external-posts";
import {
  type LocalPost,
  mergePosts,
  parseExternalPost,
  parseLocalPost,
  type Post,
  selectVisible,
} from "@/lib/posts";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

type MdxModule = { default: ComponentType; metadata?: unknown };

// Drafts are built only on request, e.g. by the end-to-end test build.
function includeDrafts(): boolean {
  return process.env.INCLUDE_DRAFTS === "1";
}

async function importPost(slug: string): Promise<MdxModule> {
  return (await import(`@/content/posts/${slug}.mdx`)) as MdxModule;
}

async function loadLocalPosts(): Promise<LocalPost[]> {
  const files = await readdir(POSTS_DIR);
  const slugs = files
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.slice(0, -".mdx".length));
  const posts = await Promise.all(
    slugs.map(async (slug) =>
      parseLocalPost(slug, (await importPost(slug)).metadata),
    ),
  );
  return selectVisible(posts, includeDrafts());
}

export async function getAllPosts(): Promise<Post[]> {
  const external = externalPosts.map((entry, index) =>
    parseExternalPost(entry, index),
  );
  return mergePosts(await loadLocalPosts(), external);
}

export async function getLocalPostSlugs(): Promise<string[]> {
  return (await loadLocalPosts()).map((post) => post.slug);
}

export async function getLocalPost(
  slug: string,
): Promise<{ post: LocalPost; Content: ComponentType }> {
  const post = (await loadLocalPosts()).find((p) => p.slug === slug);
  if (!post) {
    throw new Error(`No published post with slug "${slug}"`);
  }
  const { default: Content } = await importPost(slug);
  return { post, Content };
}
