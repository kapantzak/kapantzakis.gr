import { profile } from "@/content/profile";

/** The home page's title, which a closing sheet restores (decision 169). */
export const HOME_TITLE = `${profile.name} — ${profile.role}`;

/** Every other page's title, as Next.js applies `title.template`. */
export const TITLE_TEMPLATE = `%s — ${profile.name}`;

export function pageTitle(title: string): string {
  return TITLE_TEMPLATE.replace("%s", title);
}
