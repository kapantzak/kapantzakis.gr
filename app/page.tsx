import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PageMain } from "@/components/PageMain";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <PageMain accent="blue">
      <PageHeader
        eyebrow={`01 / ${profile.role}`}
        title={profile.headline}
        lead={profile.intro[0]}
      />
    </PageMain>
  );
}
