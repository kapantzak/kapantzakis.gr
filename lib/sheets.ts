import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  type CommunityRole,
  type Degree,
  type Profile,
  type Project,
  type Role,
  profile,
} from "@/content/profile";
import { formatPeriod } from "./period";

/** The first path segment of each group's sheets (decision 161). */
export type SheetGroup = "experience" | "projects" | "education" | "community";

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

export function projectSheet(project: Project): SheetMeta {
  const period = formatPeriod(project.period);
  return {
    group: "projects",
    slug: project.slug,
    path: sheetPath("projects", project.slug),
    title: project.name,
    subtitle: project.descriptor,
    period,
    description: `${project.name}: ${project.descriptor}, ${period}.`,
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
    ...source.projects.map(projectSheet),
    ...source.education.map(degreeSheet),
    ...source.community.map(communitySheet),
  ];
}

/** Every sheet path, which analytics counts by decision 172. */
export function sheetPaths(source: Profile): string[] {
  return sheetsOf(source).map((sheet) => sheet.path);
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
