import type { Metadata } from "next";
import { RegionEntry } from "@/components/RegionEntry";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// The home layout renders the page; this route lands on its region under the home title (decisions 173, 176, 178–179).
export default function ContactPage() {
  return <RegionEntry id="contact" />;
}
