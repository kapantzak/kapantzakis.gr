"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Brand } from "@/content/profile";
import { DetailSheet, type Origin } from "./DetailSheet";

/** A sheet as the server renders it for the host (decision 163). */
export type SheetEntry = {
  path: string;
  period: string;
  title: string;
  subtitle: string;
  brand?: Brand;
  /** Short facts in the sheet header (decision 54). */
  facts?: ReactNode;
  content: ReactNode;
  /** The tab title while the sheet is open (decision 169). */
  documentTitle: string;
};

type View = {
  path: string;
  /** The row's insets; null for a sheet the page load opened, until it closes (decision 165). */
  origin: Origin | null;
  closing: boolean;
  /** Opened by the page load, so closing replaces the URL instead of going back (decision 167). */
  byLoad: boolean;
};

type Sheets = {
  /** The sheet on screen, including while it closes. */
  shownPath: string | null;
  open: (path: string) => void;
  registerRow: (path: string, row: HTMLButtonElement | null) => void;
};

const SheetsContext = createContext<Sheets | null>(null);

export function useSheets(): Sheets {
  const sheets = use(SheetsContext);
  if (!sheets) throw new Error("useSheets must be used inside a SheetHost");
  return sheets;
}

// For a row that cannot be measured: the sheet then closes where it is.
const FULL_SCREEN: Origin = { top: 0, right: 0, bottom: 0, left: 0 };

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

// The URL says which sheet is open (decisions 161–169). Rendered by the home layout, so its sheet is a
// direct child of <body>, clear of the rows' scroll-driven transforms (decision 163).
export function SheetHost({
  sheets,
  homeTitle,
  children,
}: {
  sheets: SheetEntry[];
  homeTitle: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [view, setView] = useState<View | null>(() =>
    sheets.some((sheet) => sheet.path === pathname)
      ? { path: pathname, origin: null, closing: false, byLoad: true }
      : null,
  );
  const [rows] = useState(() => new Map<string, HTMLButtonElement>());
  // Read by the history listener and the close handlers, which outlive a render.
  const viewRef = useRef(view);
  const closeRequested = useRef(false);
  const returnFocusTo = useRef<string | null>(null);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  const measure = useCallback(
    (path: string): Origin | null => {
      const row = rows.get(path);
      return row ? insetsOf(row) : null;
    },
    [rows],
  );

  const registerRow = useCallback(
    (path: string, row: HTMLButtonElement | null) => {
      if (row) rows.set(path, row);
      else rows.delete(path);
    },
    [rows],
  );

  const open = useCallback(
    (path: string) => {
      closeRequested.current = false;
      setView({ path, origin: measure(path), closing: false, byLoad: false });
      // Not a router navigation: Next.js syncs usePathname and the page stays mounted (section 24).
      window.history.pushState(null, "", path);
    },
    [measure],
  );

  // Back and Forward move between a page and a sheet path within this document (decision 161).
  useEffect(() => {
    function onPopState() {
      const current = viewRef.current;
      const target = sheets.find(
        (sheet) => sheet.path === window.location.pathname,
      )?.path;
      if (target && (target !== current?.path || current.closing)) {
        closeRequested.current = false;
        setView({
          path: target,
          origin: measure(target),
          closing: false,
          byLoad: false,
        });
      } else if (!target && current && !current.closing) {
        setView({
          ...current,
          origin: measure(current.path) ?? current.origin ?? FULL_SCREEN,
          closing: true,
        });
      }
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [sheets, measure]);

  // Escape and the close button (decision 47).
  const requestClose = useCallback(() => {
    const current = viewRef.current;
    if (!current || current.closing || closeRequested.current) return;
    closeRequested.current = true;
    if (!current.byLoad) {
      window.history.back();
      return;
    }
    setView({
      ...current,
      origin: measure(current.path) ?? FULL_SCREEN,
      closing: true,
    });
    // A plain state object, so Next.js syncs usePathname to `/` (section 24).
    window.history.replaceState({}, "", "/");
  }, [measure]);

  const finishClosing = useCallback(() => {
    returnFocusTo.current = viewRef.current?.path ?? null;
    setView(null);
  }, []);

  // Runs after the sheet's cleanup has lifted `inert`, so the row can take focus again.
  useEffect(() => {
    if (view || !returnFocusTo.current) return;
    rows.get(returnFocusTo.current)?.focus();
    returnFocusTo.current = null;
  }, [view, rows]);

  // The sheet covers the page, so the page scrolls to its row unseen and closing lands there (decision 165).
  useLayoutEffect(() => {
    if (view?.byLoad) {
      rows
        .get(view.path)
        ?.scrollIntoView({ block: "center", behavior: "instant" });
    }
    // Only the first render can be a page load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shown = view
    ? sheets.find((sheet) => sheet.path === view.path)
    : undefined;
  const openTitle = view && !view.closing ? shown?.documentTitle : undefined;

  // pushState leaves the title alone, so the tab follows the open sheet here (decision 169).
  useEffect(() => {
    if (!openTitle) return;
    document.title = openTitle;
    return () => {
      document.title = homeTitle;
    };
  }, [openTitle, homeTitle]);

  const shownPath = view?.path ?? null;
  const value = useMemo(
    () => ({ shownPath, open, registerRow }),
    [shownPath, open, registerRow],
  );

  return (
    <SheetsContext value={value}>
      {children}
      {view && shown ? (
        <DetailSheet
          key={view.path}
          period={shown.period}
          title={shown.title}
          subtitle={shown.subtitle}
          brand={shown.brand}
          facts={shown.facts}
          origin={view.origin}
          closing={view.closing}
          onClose={requestClose}
          onClosed={finishClosing}
        >
          {shown.content}
        </DetailSheet>
      ) : null}
    </SheetsContext>
  );
}
