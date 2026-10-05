import type { ReactNode } from "react";
import styles from "./PageMain.module.css";

export function PageMain({ children }: { children: ReactNode }) {
  return (
    <main id="main" tabIndex={-1} className={styles.main}>
      {children}
    </main>
  );
}
