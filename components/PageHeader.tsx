import styles from "./PageHeader.module.css";

type Props = {
  eyebrow: string;
  title: string;
  lead?: string;
  size?: "display" | "title";
};

export function PageHeader({ eyebrow, title, lead, size = "display" }: Props) {
  return (
    <header className={styles.header}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1 className={size === "display" ? styles.display : styles.title}>
        {title}
      </h1>
      {lead ? <p className={styles.lead}>{lead}</p> : null}
    </header>
  );
}
