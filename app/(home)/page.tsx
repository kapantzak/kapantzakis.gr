import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// The home layout renders the page; this route only names it (decision 163).
export default function HomePage() {
  return null;
}
