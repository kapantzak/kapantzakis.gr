import type { CSSProperties, ReactNode } from "react";
import styles from "./HeroBackdrop.module.css";

type Glyph = {
  text: string;
  /** Position within the hero, in percent. */
  x: number;
  y: number;
  /** Font size in rem (scaled down on phones). */
  size: number;
  /** Loop length and start offset in seconds; negative delays start mid-loop so nothing moves in sync. */
  duration: number;
  delay: number;
  /** Drift distance in vw/vh and rotation in degrees. */
  dx: number;
  dy: number;
  rotate: number;
};

// The first 7 are spread across the hero on their own; phones show only those (decision 25).
const GLYPHS: Glyph[] = [
  {
    text: "{ }",
    x: 4,
    y: 8,
    size: 8,
    duration: 26,
    delay: -3,
    dx: 3,
    dy: 2,
    rotate: 8,
  },
  {
    text: "</>",
    x: 70,
    y: 4,
    size: 9,
    duration: 34,
    delay: -12,
    dx: -4,
    dy: 3,
    rotate: -10,
  },
  {
    text: "/",
    x: 48,
    y: 38,
    size: 10,
    duration: 22,
    delay: -7,
    dx: 2,
    dy: -3,
    rotate: 12,
  },
  {
    text: "01",
    x: 84,
    y: 55,
    size: 6,
    duration: 30,
    delay: -18,
    dx: -3,
    dy: -2,
    rotate: -6,
  },
  {
    text: "*",
    x: 14,
    y: 62,
    size: 7,
    duration: 19,
    delay: -5,
    dx: 3,
    dy: -2,
    rotate: 15,
  },
  {
    text: "=>",
    x: 58,
    y: 80,
    size: 5,
    duration: 38,
    delay: -20,
    dx: -2,
    dy: -3,
    rotate: 6,
  },
  {
    text: "( )",
    x: 30,
    y: 22,
    size: 4,
    duration: 24,
    delay: -9,
    dx: 2,
    dy: 3,
    rotate: -12,
  },
  {
    text: "#",
    x: 92,
    y: 26,
    size: 4,
    duration: 28,
    delay: -14,
    dx: -2,
    dy: 2,
    rotate: 10,
  },
  {
    text: ";",
    x: 40,
    y: 88,
    size: 5,
    duration: 21,
    delay: -4,
    dx: 3,
    dy: -2,
    rotate: -8,
  },
  {
    text: "[ ]",
    x: 2,
    y: 84,
    size: 6,
    duration: 36,
    delay: -25,
    dx: 2,
    dy: -3,
    rotate: 5,
  },
  {
    text: "&&",
    x: 78,
    y: 90,
    size: 3,
    duration: 18,
    delay: -2,
    dx: -3,
    dy: -2,
    rotate: -14,
  },
  {
    text: "~",
    x: 55,
    y: 12,
    size: 3.5,
    duration: 40,
    delay: -30,
    dx: 2,
    dy: 2,
    rotate: 12,
  },
];

function glyphStyle(glyph: Glyph): CSSProperties {
  return {
    "--x": `${glyph.x}%`,
    "--y": `${glyph.y}%`,
    "--size": `${glyph.size}rem`,
    "--duration": `${glyph.duration}s`,
    "--delay": `${glyph.delay}s`,
    "--dx": `${glyph.dx}vw`,
    "--dy": `${glyph.dy}vh`,
    "--rotate": `${glyph.rotate}deg`,
  } as CSSProperties;
}

// CSS-only ambient backdrop for the Home hero (decisions 22–25); the checkbox pauses it via :has().
export function HeroBackdrop({ children }: { children: ReactNode }) {
  return (
    <div className={styles.hero}>
      <div className={styles.backdrop} aria-hidden="true" data-hero-backdrop>
        {GLYPHS.map((glyph) => (
          <span
            key={glyph.text}
            className={styles.glyph}
            style={glyphStyle(glyph)}
            data-glyph
          >
            {glyph.text}
          </span>
        ))}
      </div>
      {children}
      <label className={styles.toggle}>
        <input type="checkbox" className={styles.toggleInput} />
        Pause motion
      </label>
    </div>
  );
}
