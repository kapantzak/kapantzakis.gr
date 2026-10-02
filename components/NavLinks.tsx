"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive, NAV_ITEMS } from "@/lib/nav";
import styles from "./Nav.module.css";

// The only client component: the active route is known only after navigation.
export function NavLinks() {
  const pathname = usePathname();
  return (
    <ul className={styles.links}>
      {NAV_ITEMS.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className={styles.link}
            aria-current={isActive(item.href, pathname) ? "page" : undefined}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
