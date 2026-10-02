export type PostFields = { title: string; date: string; summary: string };
export type LocalPost = PostFields & {
  kind: "local";
  slug: string;
  draft: boolean;
};
export type ExternalPost = PostFields & {
  kind: "external";
  url: string;
  source: string;
};
export type Post = LocalPost | ExternalPost;
export type ExternalPostInput = Omit<ExternalPost, "kind">;

export class PostValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PostValidationError";
  }
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
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

export function parseLocalPost(slug: string, metadata: unknown): LocalPost {
  const where = `content/posts/${slug}.mdx`;
  if (!SLUG_PATTERN.test(slug)) {
    throw new PostValidationError(
      `${where}: file name must be a lowercase kebab-case slug`,
    );
  }
  if (!isRecord(metadata)) {
    throw new PostValidationError(
      `${where}: metadata export is missing or not an object`,
    );
  }
  const draft = metadata.draft ?? false;
  if (typeof draft !== "boolean") {
    throw new PostValidationError(
      `${where}: "draft" must be a boolean when present`,
    );
  }
  return {
    kind: "local",
    slug,
    title: readString(metadata, "title", where),
    date: readDate(metadata, where),
    summary: readString(metadata, "summary", where),
    draft,
  };
}

export function parseExternalPost(input: unknown, index: number): ExternalPost {
  const where = `content/external-posts.ts[${index}]`;
  if (!isRecord(input)) {
    throw new PostValidationError(`${where}: entry must be an object`);
  }
  const url = readString(input, "url", where);
  if (!url.startsWith("https://")) {
    throw new PostValidationError(`${where}: "url" must start with https://`);
  }
  return {
    kind: "external",
    url,
    source: readString(input, "source", where),
    title: readString(input, "title", where),
    date: readDate(input, where),
    summary: readString(input, "summary", where),
  };
}

function assertUnique(values: string[], label: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value))
      throw new PostValidationError(`Duplicate ${label}: ${value}`);
    seen.add(value);
  }
}

export function mergePosts(
  local: LocalPost[],
  external: ExternalPost[],
): Post[] {
  assertUnique(
    local.map((p) => p.slug),
    "slug",
  );
  assertUnique(
    external.map((p) => p.url),
    "external URL",
  );
  return [...local, ...external].sort(
    (a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title),
  );
}

export function selectVisible(
  posts: LocalPost[],
  includeDrafts: boolean,
): LocalPost[] {
  return includeDrafts ? posts : posts.filter((p) => !p.draft);
}

export function formatPostDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
