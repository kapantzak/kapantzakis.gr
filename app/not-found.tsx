import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { PageMain } from "@/components/PageMain";

export const metadata: Metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <PageMain accent="blue">
      <PageHeader
        eyebrow="404"
        title="Not found."
        lead="That page doesn't exist, or it has moved."
      />
      <p>
        <Link href="/">Back to the home page</Link>
      </p>
    </PageMain>
  );
}
