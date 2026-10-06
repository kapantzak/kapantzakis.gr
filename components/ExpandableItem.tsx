"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { DetailSheet, type Origin } from "./DetailSheet";
import styles from "./ExpandableItem.module.css";

type Props = {
  period: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

type Phase = "closed" | "open" | "closing";

function insetsOf(el: HTMLElement): Origin {
  const rect = el.getBoundingClientRect();
  const { clientWidth, clientHeight } = document.documentElement;
  return {
    top: rect.top,
    right: clientWidth - rect.right,
    bottom: clientHeight - rect.bottom,
    left: rect.left,
  };
}

// Row that opens its details in a full-page sheet (decisions 41–47).
export function ExpandableItem({ period, title, subtitle, children }: Props) {
  const [phase, setPhase] = useState<Phase>("closed");
  const [origin, setOrigin] = useState<Origin | null>(null);
  const rowRef = useRef<HTMLButtonElement>(null);
  const closeRequested = useRef(false);
  const returnFocus = useRef(false);
  const key = useId();

  function open() {
    closeRequested.current = false;
    setOrigin(insetsOf(rowRef.current!));
    // No URL change: the entry only gives Back something to close (decision 46).
    window.history.pushState({ detailSheet: key }, "");
    setPhase("open");
  }

  const startClosing = useCallback(() => {
    if (rowRef.current) setOrigin(insetsOf(rowRef.current));
    setPhase("closing");
  }, []);

  // Escape and the close button leave through the history entry, so Back stays balanced.
  const requestClose = useCallback(() => {
    if (closeRequested.current) return;
    closeRequested.current = true;
    if (window.history.state?.detailSheet === key) window.history.back();
    else startClosing();
  }, [key, startClosing]);

  const finishClosing = useCallback(() => {
    returnFocus.current = true;
    setPhase("closed");
  }, []);

  useEffect(() => {
    if (phase !== "open") return;
    window.addEventListener("popstate", startClosing);
    return () => window.removeEventListener("popstate", startClosing);
  }, [phase, startClosing]);

  // Runs after the sheet's cleanup has lifted `inert`, so the row can take focus again.
  useEffect(() => {
    if (phase === "closed" && returnFocus.current) {
      returnFocus.current = false;
      rowRef.current?.focus();
    }
  }, [phase]);

  return (
    <li className={styles.item} data-open={phase !== "closed" || undefined}>
      <h4 className={styles.heading}>
        <button
          ref={rowRef}
          type="button"
          className={styles.trigger}
          aria-haspopup="dialog"
          onClick={open}
        >
          <span className={styles.period}>{period}</span>
          <span className={styles.title}>{title}</span>
          <span className={styles.subtitle}>{subtitle}</span>
          <span className={styles.icon} aria-hidden="true" />
        </button>
      </h4>
      {phase !== "closed" && origin ? (
        <DetailSheet
          period={period}
          title={title}
          subtitle={subtitle}
          origin={origin}
          closing={phase === "closing"}
          onClose={requestClose}
          onClosed={finishClosing}
        >
          {children}
        </DetailSheet>
      ) : null}
    </li>
  );
}
