"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { BRAND_LINK_ID, scrollToTop } from "@/lib/scroll-top";

// A Link to the URL already shown is a no-op in Next.js, so on the home page the click is handled here (decision 94).
export function BrandLink({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const onHome = usePathname() === "/";
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const modified =
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey;
    if (!onHome || modified) return;
    event.preventDefault();
    scrollToTop();
  }
  return (
    <Link
      href="/"
      id={BRAND_LINK_ID}
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
