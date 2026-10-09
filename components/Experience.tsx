import type { ReactNode } from "react";
import type { Brand, Profile, Story } from "@/content/profile";
import { formatPeriod } from "@/lib/period";
import { ExpandableItem } from "./ExpandableItem";
import { ExternalLink } from "./ExternalLink";
import styles from "./Experience.module.css";
import { RoleStory } from "./RoleStory";

type Entry = {
  id: string;
  period: string;
  title: string;
  subtitle: string;
  brand?: Brand;
  details: ReactNode;
  story?: Story;
};

// Enough blocks for the sheet to scroll, so long content is exercised.
const PLACEHOLDERS = ["Highlights", "Projects", "Stories"];

function hostOf(url: string): string {
  return new URL(url).hostname.replace(/^www\./, "");
}

function Group({ title, entries }: { title: string; entries: Entry[] }) {
  return (
    <div className={styles.group}>
      <h3 className={styles.groupTitle}>{title}</h3>
      <ol className={styles.list} aria-label={title}>
        {entries.map((entry) => (
          <ExpandableItem
            key={entry.id}
            period={entry.period}
            title={entry.title}
            subtitle={entry.subtitle}
            brand={entry.brand}
            facts={<div className={styles.facts}>{entry.details}</div>}
          >
            {entry.story ? (
              <RoleStory story={entry.story} />
            ) : (
              // Entries without a story keep the placeholders (decision 100).
              PLACEHOLDERS.map((label) => (
                <div
                  key={label}
                  className={styles.placeholder}
                  data-placeholder
                >
                  <span className={styles.placeholderLabel}>{label}</span>
                  <p>Coming soon.</p>
                </div>
              ))
            )}
          </ExpandableItem>
        ))}
      </ol>
    </div>
  );
}

export function Experience({ profile }: { profile: Profile }) {
  const work: Entry[] = profile.experience.map((role) => ({
    id: `${role.org}-${role.period.start}`,
    period: formatPeriod(role.period),
    title: role.org,
    subtitle: role.title,
    brand: role.brand,
    story: role.story,
    details: (
      <>
        {role.stack.length > 0 ? (
          <ul className={styles.tags} aria-label="Stack">
            {role.stack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        ) : null}
        {role.orgUrl ? (
          <ExternalLink href={role.orgUrl}>{hostOf(role.orgUrl)}</ExternalLink>
        ) : null}
      </>
    ),
  }));

  const education: Entry[] = profile.education.map((degree) => ({
    id: `${degree.institution}-${degree.period.start}`,
    period: formatPeriod(degree.period),
    title: degree.degree,
    subtitle: degree.institution,
    brand: degree.brand,
    details: (
      <>
        {degree.program ? (
          <ExternalLink href={degree.program.url}>
            {degree.program.label}
          </ExternalLink>
        ) : null}
        {degree.thesis ? (
          <ExternalLink href={degree.thesis.url}>
            {degree.thesis.label}
          </ExternalLink>
        ) : null}
      </>
    ),
  }));

  const community: Entry[] = profile.community.map((entry) => ({
    id: `${entry.org}-${entry.period.start}`,
    period: formatPeriod(entry.period),
    title: entry.org,
    subtitle: entry.title,
    brand: entry.brand,
    details: (
      <>
        <p>{entry.summary}</p>
        <ExternalLink href={entry.orgUrl}>{hostOf(entry.orgUrl)}</ExternalLink>
      </>
    ),
  }));

  return (
    <>
      <Group title="Work" entries={work} />
      <Group title="Education" entries={education} />
      <Group title="Community" entries={community} />
    </>
  );
}
