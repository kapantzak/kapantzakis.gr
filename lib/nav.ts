/** In-page sections of the one-page site (decision 40); `id` matches the section's element id. */
export const NAV_ITEMS = [
  { id: "experience", label: "Experience" },
  { id: "writing", label: "Writing" },
  { id: "contact", label: "Contact" },
] as const;

export type SectionId = (typeof NAV_ITEMS)[number]["id"];

/** Absolute so the links also work from the 404 page. */
export function sectionHref(id: SectionId): string {
  return `/#${id}`;
}

// Each place with a path of its own (decision 173) and the nav item it marks as current (decision 181).
const REGION_SECTIONS = {
  experience: "experience",
  education: "experience",
  community: "experience",
  writing: "writing",
  contact: "contact",
} as const satisfies Record<string, SectionId>;

/** A region's element id; Education and Community are groups inside Experience. */
export type RegionId = keyof typeof REGION_SECTIONS;

/** In reading order, so a group comes after the section it sits in (decision 174). */
export const REGIONS = Object.keys(REGION_SECTIONS) as RegionId[];

/** A region's own path; absolute, so links also work from the 404 page (decision 173). */
export function regionPath(id: RegionId): string {
  return `/${id}`;
}

/** The region a pathname names; null for `/` and every other path. */
export function regionOf(pathname: string): RegionId | null {
  return REGIONS.find((id) => regionPath(id) === pathname) ?? null;
}

/** `/` and the region paths are all the home page (decision 183). */
export function isHomePath(pathname: string): boolean {
  return pathname === "/" || regionOf(pathname) !== null;
}

/** The nav item a region marks as current (decision 181). */
export function sectionOf(id: RegionId): SectionId {
  return REGION_SECTIONS[id];
}
