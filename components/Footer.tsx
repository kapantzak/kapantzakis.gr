import { profile } from "@/content/profile";
import { gaId } from "@/lib/gtag";
import { BackToTop } from "./BackToTop";
import { CookieSettings } from "./CookieSettings";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <ul className={styles.links} aria-label="Social links">
        {profile.social.map((link) => (
          <li key={link.url}>
            <a href={link.url} target="_blank" rel="me noopener noreferrer">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
      <div className={styles.end}>
        <BackToTop />
        {/* A full page load, not a client navigation: a path write from the home page's scroll tracker during one
            would cancel it (decision 229). */}
        <a href="/privacy">Privacy</a>
        {/* Only where analytics can run (decision 222). */}
        {gaId() && <CookieSettings />}
        <p className={styles.copy}>
          © {new Date().getFullYear()} {profile.name}
        </p>
      </div>
    </footer>
  );
}
