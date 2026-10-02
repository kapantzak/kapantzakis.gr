import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PageMain } from "@/components/PageMain";
import { PostList } from "@/components/PostList";
import { getAllPosts } from "@/lib/post-source";

export const metadata: Metadata = {
  title: "Posts",
  description: "Writing about frontend engineering.",
  alternates: { canonical: "/posts" },
};

export default async function PostsPage() {
  const posts = await getAllPosts();
  return (
    <PageMain accent="magenta" theme="light">
      <PageHeader eyebrow="03 / Writing" title="Posts" />
      <PostList posts={posts} label="All posts" headingLevel={2} />
    </PageMain>
  );
}
