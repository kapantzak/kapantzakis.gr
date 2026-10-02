import type { ReactNode } from "react";
import styles from "./Prose.module.css";

export function Prose({ children }: { children: ReactNode }) {
  return <div className={styles.prose}>{children}</div>;
}
