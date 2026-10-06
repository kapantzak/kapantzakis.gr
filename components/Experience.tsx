import type { ReactNode } from "react";
import type { Brand, Profile } from "@/content/profile";
import { formatPeriod } from "@/lib/period";
import { ExpandableItem } from "./ExpandableItem";
import styles from "./Experience.module.css";

type Entry = {
  id: string;
  period: string;
  title: string;
  subtitle: string;
  brand?: Brand;
  details: ReactNode;
};

// Enough blocks for the sheet to scroll, so long content is exercised.
const PLACEHOLDERS = ["Highlights", "Projects", "Stories"];

function ExternalLink({ href, children }: { href: string; children: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span aria-hidden="true"> ↗</span>
    </a>
  );
}

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
          >
            <div className={styles.facts}>{entry.details}</div>
            {/* Rich per-entry content is designed later (decision 45). */}
            {PLACEHOLDERS.map((label) => (
              <div key={label} className={styles.placeholder} data-placeholder>
                <span className={styles.placeholderLabel}>{label}</span>
                <p>Coming soon.</p>
              </div>
            ))}
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
    details: degree.thesis ? (
      <ExternalLink href={degree.thesis.url}>
        {degree.thesis.label}
      </ExternalLink>
    ) : null,
  }));

  const community: Entry[] = profile.community.map((entry) => ({
    id: `${entry.org}-${entry.period.start}`,
    period: formatPeriod(entry.period),
    title: entry.org,
    subtitle: entry.title,
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
