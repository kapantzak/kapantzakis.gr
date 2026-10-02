import type { ReactNode } from "react";
import styles from "./PageMain.module.css";

export type Accent = "blue" | "magenta" | "lime" | "orange";

type Props = { accent: Accent; theme?: "dark" | "light"; children: ReactNode };

// data-theme / data-accent are read by :root:has(...) rules in styles/tokens.css.
export function PageMain({ accent, theme = "dark", children }: Props) {
  return (
    <main
      id="main"
      tabIndex={-1}
      className={styles.main}
      data-theme={theme}
      data-accent={accent}
    >
      {children}
    </main>
  );
}
