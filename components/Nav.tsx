import Image from "next/image";
import logo from "@/assets/brand/jk-logo.png";
import { profile } from "@/content/profile";
import { BrandLink } from "./BrandLink";
import { NavLinks } from "./NavLinks";
import styles from "./Nav.module.css";

export function Nav() {
  return (
    <header className={styles.header}>
      <nav aria-label="Main" className={styles.nav}>
        <BrandLink className={styles.brand}>
          {/* Decorative: the link is named by the name that follows. The 128px source stays sharp up to 3x. */}
          <Image
            src={logo}
            alt=""
            width={40}
            height={40}
            className={styles.logo}
            unoptimized
            priority
          />
          <span>{profile.name}</span>
        </BrandLink>
        <NavLinks />
      </nav>
      <div className={styles.progress} aria-hidden="true" />
    </header>
  );
}
