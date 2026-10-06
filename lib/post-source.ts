import { externalPosts } from "@/content/external-posts";
import { orderPosts, parsePost, type Post } from "@/lib/posts";

export function getAllPosts(): Post[] {
  return orderPosts(
    externalPosts.map((entry, index) => parsePost(entry, index)),
  );
}
