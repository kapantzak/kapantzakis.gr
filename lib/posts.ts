/** An article published elsewhere; the site links out to it (decision 35). */
export type Post = {
  title: string;
  date: string;
  summary: string;
  url: string;
  source: string;
};

export class PostValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PostValidationError";
  }
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Fixed month abbreviations because ICU's en-GB "short" month varies (e.g., "Sept" vs "Sep").
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(
  record: Record<string, unknown>,
  key: string,
  where: string,
): string {
  const value = record[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new PostValidationError(
      `${where}: "${key}" must be a non-empty string`,
    );
  }
  return value;
}

function readDate(record: Record<string, unknown>, where: string): string {
  const value = readString(record, "date", where);
  const parsed = new Date(`${value}T00:00:00Z`);
  // The round-trip rejects impossible days such as 2026-02-30 that Date would roll over.
  if (
    !DATE_PATTERN.test(value) ||
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    throw new PostValidationError(
      `${where}: "date" must be a real date in YYYY-MM-DD format`,
    );
  }
  return value;
}

export function parsePost(input: unknown, index: number): Post {
  const where = `content/external-posts.ts[${index}]`;
  if (!isRecord(input)) {
    throw new PostValidationError(`${where}: entry must be an object`);
  }
  const url = readString(input, "url", where);
  if (!url.startsWith("https://")) {
    throw new PostValidationError(`${where}: "url" must start with https://`);
  }
  return {
    url,
    source: readString(input, "source", where),
    title: readString(input, "title", where),
    date: readDate(input, where),
    summary: readString(input, "summary", where),
  };
}

/** Newest first; rejects the same article listed twice. */
export function orderPosts(posts: Post[]): Post[] {
  const seen = new Set<string>();
  for (const { url } of posts) {
    if (seen.has(url)) throw new PostValidationError(`Duplicate URL: ${url}`);
    seen.add(url);
  }
  return [...posts].sort(
    (a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title),
  );
}

export function formatPostDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
