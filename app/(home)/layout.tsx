import type { ReactNode } from "react";
import { Experience, experienceSheets } from "@/components/Experience";
import { Hero } from "@/components/Hero";
import { PageMain } from "@/components/PageMain";
import { PostList } from "@/components/PostList";
import { RegionScroll } from "@/components/RegionScroll";
import { Section } from "@/components/Section";
import { SheetHost } from "@/components/SheetHost";
import { profile } from "@/content/profile";
import { getAllPosts } from "@/lib/post-source";
import { HOME_TITLE } from "@/lib/titles";
import styles from "./layout.module.css";

// The whole site, read by scrolling (decision 30). A layout rather than a page, so it stays mounted across `/`
// and every sheet path, and opening or closing a sheet never remounts it (decision 163).
export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SheetHost sheets={experienceSheets(profile)} homeTitle={HOME_TITLE}>
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
            <p className={styles.lead}>
              Email is the quickest way to reach me.
            </p>
            <p className={styles.email}>
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </p>
            <ul className={styles.social} aria-label="Elsewhere">
              {profile.social.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="me noopener noreferrer"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        </PageMain>
      </SheetHost>
      {children}
      <RegionScroll />
    </>
  );
}
