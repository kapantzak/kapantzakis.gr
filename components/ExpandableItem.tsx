"use client";

import type { CSSProperties } from "react";
import type { Brand } from "@/content/profile";
import styles from "./ExpandableItem.module.css";
import { useSheets } from "./SheetHost";

type Props = {
  /** Its sheet's own path (decision 161). */
  path: string;
  period: string;
  title: string;
  subtitle: string;
  brand?: Brand;
};

// Row that opens its sheet at the sheet's path; the home layout's SheetHost renders the sheet (decisions 41, 163).
export function ExpandableItem({
  path,
  period,
  title,
  subtitle,
  brand,
}: Props) {
  const { shownPath, open, registerRow } = useSheets();
  return (
    <li
      className={styles.item}
      data-open={shownPath === path || undefined}
      // The row wipes in the brand colour the sheet grows out of (decision 53).
      style={
        brand ? ({ "--accent": brand.accent } as CSSProperties) : undefined
      }
    >
      <h4 className={styles.heading}>
        <button
          ref={(row) => registerRow(path, row)}
          type="button"
          className={styles.trigger}
          aria-haspopup="dialog"
          onClick={() => open(path)}
        >
          <span className={styles.period}>{period}</span>
          <span className={styles.title}>{title}</span>
          <span className={styles.subtitle}>{subtitle}</span>
          <span className={styles.icon} aria-hidden="true" />
        </button>
      </h4>
    </li>
  );
}
