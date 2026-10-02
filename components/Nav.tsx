import Link from "next/link";
import { profile } from "@/content/profile";
import { NavLinks } from "./NavLinks";
import styles from "./Nav.module.css";

export function Nav() {
  return (
    <header className={styles.header}>
      <nav aria-label="Main" className={styles.nav}>
        <Link href="/" className={styles.brand}>
          {profile.name}
        </Link>
        <NavLinks />
      </nav>
    </header>
  );
}
