import type { ReactNode } from "react";
import styles from "./Section.module.css";

type Props = { index: string; title: string; children: ReactNode };

export function Section({ index, title, children }: Props) {
  const headingId = `section-${index}`;
  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.heading}>
        <span className={styles.index} aria-hidden="true">
          {index} /{" "}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}
