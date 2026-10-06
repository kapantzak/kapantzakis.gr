import type { Metadata } from "next";
import { Experience } from "@/components/Experience";
import { Hero } from "@/components/Hero";
import { PageMain } from "@/components/PageMain";
import { PostList } from "@/components/PostList";
import { Section } from "@/components/Section";
import { profile } from "@/content/profile";
import { getAllPosts } from "@/lib/post-source";
import styles from "./page.module.css";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// The whole site, read by scrolling (decision 30).
export default function HomePage() {
  return (
    <PageMain>
      <Hero
        eyebrow={profile.role}
        headline={profile.headline}
        intro={profile.intro}
      />
      <Section id="experience" index="01" title="Experience">
        <Experience profile={profile} />
      </Section>
      <Section
        id="writing"
        index="02"
        title="Writing"
        tone="lime"
        direction="reverse"
      >
        <PostList posts={getAllPosts()} label="All posts" />
      </Section>
      <Section id="contact" index="03" title="Say hello" tone="magenta">
        <p className={styles.lead}>Email is the quickest way to reach me.</p>
        <p className={styles.email}>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </p>
        <ul className={styles.social} aria-label="Elsewhere">
          {profile.social.map((link) => (
            <li key={link.url}>
              <a href={link.url} target="_blank" rel="me noopener noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </Section>
    </PageMain>
  );
}
