import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/post-source";
import type { LocalPost, Post } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";

const STATIC_PATHS = ["", "/about", "/posts", "/contact"];

function isLocal(post: Post): post is LocalPost {
  return post.kind === "local";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const localPosts = (await getAllPosts()).filter(isLocal);
  return [
    ...STATIC_PATHS.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...localPosts.map((post) => ({
      url: `${SITE_URL}/posts/${post.slug}`,
      lastModified: post.date,
    })),
  ];
}
