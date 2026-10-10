import type { ReactNode } from "react";
import type { Brand, Profile, Story } from "@/content/profile";
import {
  communitySheet,
  degreeSheet,
  roleSheet,
  type SheetMeta,
} from "@/lib/sheets";
import { pageTitle } from "@/lib/titles";
import { ExpandableItem } from "./ExpandableItem";
import { ExternalLink } from "./ExternalLink";
import styles from "./Experience.module.css";
import { RoleStory } from "./RoleStory";
import type { SheetEntry } from "./SheetHost";

type Entry = {
  sheet: SheetMeta;
  brand?: Brand;
  details: ReactNode;
  story?: Story;
};

type GroupData = { title: string; entries: Entry[] };

// Enough blocks for the sheet to scroll, so long content is exercised.
const PLACEHOLDERS = ["Highlights", "Projects", "Stories"];

function hostOf(url: string): string {
  return new URL(url).hostname.replace(/^www\./, "");
}

function groupsOf(profile: Profile): GroupData[] {
  return [
    {
      title: "Work",
      entries: profile.experience.map((role) => ({
        sheet: roleSheet(role),
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
              <ExternalLink href={role.orgUrl}>
                {hostOf(role.orgUrl)}
              </ExternalLink>
            ) : null}
          </>
        ),
      })),
    },
    {
      title: "Education",
      entries: profile.education.map((degree) => ({
        sheet: degreeSheet(degree),
        brand: degree.brand,
        story: degree.story,
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
      })),
    },
    {
      title: "Community",
      entries: profile.community.map((entry) => ({
        sheet: communitySheet(entry),
        brand: entry.brand,
        details: (
          <>
            <p>{entry.summary}</p>
            <ExternalLink href={entry.orgUrl}>
              {hostOf(entry.orgUrl)}
            </ExternalLink>
          </>
        ),
      })),
    },
  ];
}

function Group({ title, entries }: GroupData) {
  return (
    <div className={styles.group}>
      <h3 className={styles.groupTitle}>{title}</h3>
      <ol className={styles.list} aria-label={title}>
        {entries.map(({ sheet, brand }) => (
          <ExpandableItem
            key={sheet.path}
            path={sheet.path}
            period={sheet.period}
            title={sheet.title}
            subtitle={sheet.subtitle}
            brand={brand}
          />
        ))}
      </ol>
    </div>
  );
}

export function Experience({ profile }: { profile: Profile }) {
  return (
    <>
      {groupsOf(profile).map((group) => (
        <Group key={group.title} {...group} />
      ))}
    </>
  );
}

/** Every row's sheet, for the home layout's SheetHost (decision 163). */
export function experienceSheets(profile: Profile): SheetEntry[] {
  return groupsOf(profile).flatMap(({ entries }) =>
    entries.map(({ sheet, brand, details, story }) => ({
      path: sheet.path,
      period: sheet.period,
      title: sheet.title,
      subtitle: sheet.subtitle,
      brand,
      facts: <div className={styles.facts}>{details}</div>,
      content: story ? (
        <RoleStory story={story} />
      ) : (
        // Entries without a story keep the placeholders (decision 100).
        PLACEHOLDERS.map((label) => (
          <div key={label} className={styles.placeholder} data-placeholder>
            <span className={styles.placeholderLabel}>{label}</span>
            <p>Coming soon.</p>
          </div>
        ))
      ),
      documentTitle: pageTitle(sheet.title),
    })),
  );
}
