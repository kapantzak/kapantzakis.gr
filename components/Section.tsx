import type { ReactNode } from "react";
import styles from "./Section.module.css";

type Props = {
  id: string;
  index: string;
  title: string;
  /** Lime fills the whole section; magenta only recolours its accent (decision 38). */
  tone?: "lime" | "magenta";
  /** Heading slides right-to-left by default; "reverse" alternates sections. */
  direction?: "forward" | "reverse";
  children: ReactNode;
};

// Decorative repeats make the heading read as one endless line while it slides (section 13).
const ECHOES = 3;

export function Section({
  id,
  index,
  title,
  tone,
  direction = "forward",
  children,
}: Props) {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      className={styles.section}
      aria-labelledby={headingId}
      data-tone={tone}
    >
      <h2 id={headingId} className={styles.heading} data-direction={direction}>
        <span className={styles.track}>
          <span className={styles.index} aria-hidden="true">
            {index}
          </span>
          <span>{title}</span>
          {Array.from({ length: ECHOES }, (_, i) => (
            <span key={i} className={styles.echo} aria-hidden="true">
              {title}
            </span>
          ))}
        </span>
      </h2>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
