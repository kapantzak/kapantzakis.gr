import { profile } from "@/content/profile";
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
      <p className={styles.copy}>
        © {new Date().getFullYear()} {profile.name}
      </p>
    </footer>
  );
}
