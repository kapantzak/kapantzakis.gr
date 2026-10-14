"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { isHomePath, regionPath, type RegionId } from "@/lib/nav";

type Props = {
  id: RegionId;
  className?: string;
  "aria-current"?: "true";
  children: ReactNode;
};

// On the home page a Link would be a router navigation that scrolls to the top, so the click is handled here; from
// another page (the 404) the Link navigates and the home page lands on the region (decision 175).
export function SectionLink({
  id,
  className,
  "aria-current": ariaCurrent,
  children,
}: Props) {
  const onHome = isHomePath(usePathname());
  const path = regionPath(id);
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const modified =
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey;
    if (!onHome || modified) return;
    event.preventDefault();
    // Plain state objects, so Next.js syncs usePathname (section 26); clicking the current path adds no Back step.
    // The query string stays, as it does when scrolling (decision 185).
    const url = path + window.location.search;
    if (window.location.pathname === path) history.replaceState({}, "", url);
    else history.pushState(null, "", url);
    // No `behavior`: the CSS `scroll-behavior` on <html> decides, so reduced motion jumps (decision 96).
    document.getElementById(id)?.scrollIntoView();
  }
  return (
    <Link
      href={path}
      className={className}
      aria-current={ariaCurrent}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
