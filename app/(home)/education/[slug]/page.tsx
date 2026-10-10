import type { Metadata } from "next";
import { sheetMetadata, sheetParams } from "@/lib/sheets";

export const dynamicParams = false;

export function generateStaticParams() {
  return sheetParams("education");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return sheetMetadata("education", slug);
}

// The home layout renders the page and opens this sheet from the URL; the route only names it (decision 163).
export default function EducationSheetPage() {
  return null;
}
