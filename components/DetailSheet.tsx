"use client";

import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import styles from "./DetailSheet.module.css";

/** Insets of the opening row from each viewport edge, in pixels. */
export type Origin = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type Props = {
  period: string;
  title: string;
  subtitle: string;
  origin: Origin;
  closing: boolean;
  /** The visitor asked to close. */
  onClose: () => void;
  /** The closing animation has finished. */
  onClosed: () => void;
  children: ReactNode;
};

// Full-page modal sheet (decisions 41–47). Portalled to <body>: rows carry
// scroll-driven transforms, which would trap a fixed-position sheet inside them.
export function DetailSheet({
  period,
  title,
  subtitle,
  origin,
  closing,
  onClose,
  onClosed,
  children,
}: Props) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  // Modality: everything outside the sheet is inert and the page stops scrolling.
  useEffect(() => {
    const sheet = sheetRef.current!;
    const root = document.documentElement;
    const others = Array.from(document.body.children).filter(
      (el) => el !== sheet && !el.hasAttribute("inert"),
    );
    for (const el of others) el.setAttribute("inert", "");
    // Measured before the lock hides the scrollbar. A reserved gutter would paint over the sheet's own scrollbar.
    const gap = window.innerWidth - root.clientWidth;
    root.style.setProperty("--scrollbar-gap", `${gap}px`);
    root.setAttribute("data-sheet-open", "");
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      for (const el of others) el.removeAttribute("inert");
      root.removeAttribute("data-sheet-open");
      root.style.removeProperty("--scrollbar-gap");
    };
  }, []);

  // Unmount only after the exit animation; with no animations (reduced motion off, jsdom) that is immediate.
  useEffect(() => {
    if (!closing) return;
    let cancelled = false;
    const running = sheetRef.current?.getAnimations?.({ subtree: true }) ?? [];
    void Promise.allSettled(running.map((a) => a.finished)).then(() => {
      if (!cancelled) onClosed();
    });
    return () => {
      cancelled = true;
    };
  }, [closing, onClosed]);

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  }

  const insets = {
    "--from-top": `${origin.top}px`,
    "--from-right": `${origin.right}px`,
    "--from-bottom": `${origin.bottom}px`,
    "--from-left": `${origin.left}px`,
  } as CSSProperties;

  return createPortal(
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={styles.sheet}
      data-closing={closing || undefined}
      style={insets}
      onKeyDown={onKeyDown}
    >
      <div className={styles.bar}>
        <button
          ref={closeRef}
          type="button"
          className={styles.close}
          aria-label="Close"
          onClick={onClose}
        />
      </div>
      <div className={styles.content}>
        <header className={styles.header}>
          <p className={styles.period}>{period}</p>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </header>
        {children}
      </div>
    </div>,
    document.body,
  );
}
