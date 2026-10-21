import type { Metadata } from "next";
import { PageMain } from "@/components/PageMain";
import cv from "@/cv/content.json";
import "@/cv/cv.css";
import { renderCv } from "@/cv/template.mjs";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "CV",
  description:
    "Experience, open source, writing, skills and education, with a PDF to download.",
  alternates: { canonical: "/cv" },
};

// The same markup and styles as the PDF, so the two cannot drift (decision 233).
export default function Cv() {
  return (
    <PageMain>
      {/* One wrapper: PageMain's gap is sized for sections, not for a button above a sheet. */}
      <div className={styles.page}>
        <div className={styles.bar}>
          <a
            href={`/${cv.outputBasename}.pdf`}
            download
            className={styles.download}
          >
            Download PDF
          </a>
        </div>
        {/* The repo's own data, escaped by the template. */}
        <div
          className={styles.sheet}
          dangerouslySetInnerHTML={{ __html: renderCv(cv) }}
        />
      </div>
    </PageMain>
  );
}
