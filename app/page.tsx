import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { PageMain } from "@/components/PageMain";
import { PostList } from "@/components/PostList";
import { Section } from "@/components/Section";
import { profile } from "@/content/profile";
import { getAllPosts } from "@/lib/post-source";
import styles from "./page.module.css";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const latest = (await getAllPosts()).slice(0, 3);
  return (
    <PageMain accent="blue">
      <PageHeader
        eyebrow={`01 / ${profile.role}`}
        title={profile.headline}
        lead={profile.intro[0]}
      />
      <Section index="01" title="Latest writing">
        <PostList posts={latest} label="Latest posts" headingLevel={3} />
        <p className={styles.more}>
          <Link href="/posts">All posts</Link>
        </p>
      </Section>
      <Section index="02" title="Say hello">
        <p className={styles.ctas}>
          <Link href="/about">More about me</Link>
          <Link href="/contact">Get in touch</Link>
        </p>
      </Section>
    </PageMain>
  );
}
