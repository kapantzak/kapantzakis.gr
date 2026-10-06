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
