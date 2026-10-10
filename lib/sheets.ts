import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  type CommunityRole,
  type Degree,
  type Profile,
  type Role,
  profile,
} from "@/content/profile";
import { formatPeriod } from "./period";

/** The first path segment of each group's sheets (decision 161). */
export type SheetGroup = "experience" | "education" | "community";

/** What a sheet's row, route metadata and sitemap entry share. */
export type SheetMeta = {
  group: SheetGroup;
  slug: string;
  path: string;
  title: string;
  subtitle: string;
  period: string;
  /** The route's meta description (decision 168). */
  description: string;
};

export function sheetPath(group: SheetGroup, slug: string): string {
  return `/${group}/${slug}`;
}

export function roleSheet(role: Role): SheetMeta {
  const period = formatPeriod(role.period);
  return {
    group: "experience",
    slug: role.slug,
    path: sheetPath("experience", role.slug),
    title: role.org,
    subtitle: role.title,
    period,
    description: `${role.title} at ${role.org}, ${period}.`,
  };
}

export function degreeSheet(degree: Degree): SheetMeta {
  const period = formatPeriod(degree.period);
  return {
    group: "education",
    slug: degree.slug,
    path: sheetPath("education", degree.slug),
    title: degree.degree,
    subtitle: degree.institution,
    period,
    description: `${degree.degree}, ${degree.institution}, ${period}.`,
  };
}

export function communitySheet(entry: CommunityRole): SheetMeta {
  const period = formatPeriod(entry.period);
  return {
    group: "community",
    slug: entry.slug,
    path: sheetPath("community", entry.slug),
    title: entry.org,
    subtitle: entry.title,
    period,
    description: `${entry.title} at ${entry.org}, ${period}.`,
  };
}

/** Every sheet, in the order the page shows its rows. */
export function sheetsOf(source: Profile): SheetMeta[] {
  return [
    ...source.experience.map(roleSheet),
    ...source.education.map(degreeSheet),
    ...source.community.map(communitySheet),
  ];
}

/** Each sheet path's route, as analytics reports it (decision 171). */
export function sheetRoutes(source: Profile): Record<string, string> {
  return Object.fromEntries(
    sheetsOf(source).map((sheet) => [sheet.path, `/${sheet.group}/[slug]`]),
  );
}

/** Static params for a group's `[slug]` route. */
export function sheetParams(group: SheetGroup): { slug: string }[] {
  return sheetsOf(profile)
    .filter((sheet) => sheet.group === group)
    .map(({ slug }) => ({ slug }));
}

/** A sheet route's metadata (decision 168); an unknown slug is a 404. */
export function sheetMetadata(group: SheetGroup, slug: string): Metadata {
  const sheet = sheetsOf(profile).find(
    (s) => s.group === group && s.slug === slug,
  );
  if (!sheet) notFound();
  return {
    title: sheet.title,
    description: sheet.description,
    alternates: { canonical: sheet.path },
  };
}
