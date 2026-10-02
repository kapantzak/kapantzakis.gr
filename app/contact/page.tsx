import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PageMain } from "@/components/PageMain";
import { Section } from "@/components/Section";
import { profile } from "@/content/profile";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to get in touch.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <PageMain accent="orange">
      <PageHeader
        eyebrow="04 / Contact"
        title="Say hello."
        lead="Email is the quickest way to reach me."
      />
      <p className={styles.email}>
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
      </p>
      <Section index="01" title="Elsewhere">
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
