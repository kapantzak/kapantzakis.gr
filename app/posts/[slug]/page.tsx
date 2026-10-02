import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PageMain } from "@/components/PageMain";
import { Prose } from "@/components/Prose";
import { getLocalPost, getLocalPostSlugs } from "@/lib/post-source";
import { formatPostDate } from "@/lib/posts";
import styles from "./page.module.css";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return (await getLocalPostSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { post } = await getLocalPost(slug);
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/posts/${slug}` },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const { post, Content } = await getLocalPost(slug);
  return (
    <PageMain accent="magenta" theme="light">
      <article className={styles.article}>
        <PageHeader
          eyebrow={formatPostDate(post.date)}
          title={post.title}
          lead={post.summary}
          size="title"
        />
        <Prose>
          <Content />
        </Prose>
      </article>
    </PageMain>
  );
}
