"use client";

import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
} from "react";
import Image from "next/image";
import type { Brand } from "@/content/profile";
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
  brand?: Brand;
  /** Short facts in the header, so a brand band carries them too (decision 54). */
  facts?: ReactNode;
  /** The row it grows from; null when the page load opened it (decision 165). */
  origin: Origin | null;
  closing: boolean;
  /** The visitor asked to close. */
  onClose: () => void;
  /** The closing animation has finished. */
  onClosed: () => void;
  children: ReactNode;
};

/** Everything beside the sheet and beside each of its ancestors, up to <body>. */
function outsideOf(sheet: HTMLElement): Element[] {
  const outside: Element[] = [];
  for (
    let node: Element = sheet;
    node.parentElement && node !== document.body;
    node = node.parentElement
  ) {
    for (const sibling of Array.from(node.parentElement.children)) {
      if (sibling !== node) outside.push(sibling);
    }
  }
  return outside;
}

// Full-page modal sheet (decisions 41–47), with an optional brand band (48–53). SheetHost renders it as a direct
// child of <body> (decision 163): rows carry scroll-driven transforms, which would trap a fixed-position sheet.
export function DetailSheet({
  period,
  title,
  subtitle,
  brand,
  facts,
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
    // Not only <body>'s children: the sheet need not sit directly in <body> (tests, decision 163).
    const others = outsideOf(sheet).filter((el) => !el.hasAttribute("inert"));
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
    // Scroll-driven animations finish only once scrolled through, so they would hold the sheet open.
    const running = (
      sheetRef.current?.getAnimations?.({ subtree: true }) ?? []
    ).filter((a) => a.timeline === document.timeline);
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

  const vars = {
    ...(origin && {
      "--from-top": `${origin.top}px`,
      "--from-right": `${origin.right}px`,
      "--from-bottom": `${origin.bottom}px`,
      "--from-left": `${origin.left}px`,
    }),
    ...(brand && {
      "--accent": brand.accent,
      "--brand-bg": brand.background,
      "--brand-link": brand.link,
    }),
  } as CSSProperties;

  const header = (
    <header className={styles.header}>
      <p className={styles.period}>{period}</p>
      <h2 id={titleId} className={styles.title}>
        {brand?.logo && brand.lockup ? (
          // The lockup text names the dialog, so the logo beside it is decorative (decision 92).
          <>
            <Image src={brand.logo} alt="" className={styles.logo} />
            <span className={styles.lockup}>
              <span>{brand.lockup[0]}</span> <span>{brand.lockup[1]}</span>
            </span>
          </>
        ) : brand?.logo ? (
          // The logo is the title, so its alt text names the dialog (decision 50).
          <Image src={brand.logo} alt={title} className={styles.logo} />
        ) : (
          title
        )}
      </h2>
      <p className={styles.subtitle}>{subtitle}</p>
      {facts}
    </header>
  );

  return (
    <div
      ref={sheetRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={styles.sheet}
      data-closing={closing || undefined}
      data-entry={origin ? undefined : "url"}
      style={vars}
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
      {brand ? (
        <div className={styles.band} data-brand data-tone={brand.tone}>
          {header}
          {brand.visual ? (
            <div className={styles.visual} aria-hidden="true">
              <Image
                src={brand.visual}
                alt=""
                fill
                // Covering the band's height can draw it wider than half the screen.
                sizes="(min-width: 48rem) max(50vw, 52rem), 100vw"
                className={styles.visualImage}
              />
            </div>
          ) : null}
        </div>
      ) : null}
      <div className={styles.content}>
        {brand ? null : header}
        {children}
      </div>
    </div>
  );
}
