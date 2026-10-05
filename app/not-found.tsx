import type { Metadata } from "next";
import Link from "next/link";
import { PageMain } from "@/components/PageMain";
import styles from "./not-found.module.css";

export const metadata: Metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <PageMain>
      <header className={styles.header}>
        <p className={styles.eyebrow}>404</p>
        <h1 className={styles.title}>Not found.</h1>
        <p className={styles.lead}>
          That page doesn&apos;t exist, or it has moved.
        </p>
      </header>
      <p>
        <Link href="/">Back to the home page</Link>
      </p>
    </PageMain>
  );
}
