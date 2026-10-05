"use client";

import { type ReactNode, useId, useState } from "react";
import styles from "./ExpandableItem.module.css";

type Props = {
  period: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

// Disclosure row (decision 33): the panel stays in the DOM so it can animate, and is inert while closed.
export function ExpandableItem({ period, title, subtitle, children }: Props) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const buttonId = `${id}-button`;
  const panelId = `${id}-panel`;
  return (
    <li className={styles.item} data-open={open || undefined}>
      <h4 className={styles.heading}>
        <button
          type="button"
          id={buttonId}
          className={styles.trigger}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          <span className={styles.period}>{period}</span>
          <span className={styles.title}>{title}</span>
          <span className={styles.subtitle}>{subtitle}</span>
          <span className={styles.icon} aria-hidden="true" />
        </button>
      </h4>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={styles.panel}
        inert={!open}
      >
        <div className={styles.panelInner}>{children}</div>
      </div>
    </li>
  );
}
