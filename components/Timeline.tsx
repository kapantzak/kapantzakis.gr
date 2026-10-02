import { formatPeriod, type Period } from "@/lib/period";
import styles from "./Timeline.module.css";

export type TimelineEntry = {
  id: string;
  period: Period;
  title: string;
  org: string;
  orgUrl?: string;
  meta?: string;
  description?: string;
  link?: { label: string; url: string };
};

export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className={styles.timeline}>
      {entries.map((entry) => (
        <li key={entry.id} className={styles.entry}>
          <p className={styles.period}>{formatPeriod(entry.period)}</p>
          <div className={styles.body}>
            <h3 className={styles.title}>{entry.title}</h3>
            <p className={styles.org}>
              {entry.orgUrl ? (
                <a
                  href={entry.orgUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {entry.org}
                </a>
              ) : (
                entry.org
              )}
            </p>
            {entry.meta ? <p className={styles.meta}>{entry.meta}</p> : null}
            {entry.description ? <p>{entry.description}</p> : null}
            {entry.link ? (
              <p>
                <a
                  href={entry.link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {entry.link.label}
                </a>
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
