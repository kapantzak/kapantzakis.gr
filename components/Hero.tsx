import type { CSSProperties } from "react";
import { HeroAurora } from "./HeroAurora";
import styles from "./Hero.module.css";
import { SectionLink } from "./SectionLink";

type Props = { eyebrow: string; headline: string; intro: string[] };

/** Splits the headline into two lines of near-equal word count, first line longer. */
export function splitHeadline(headline: string): [string[], string[]] {
  const words = headline.trim().split(/\s+/);
  const cut = Math.ceil(words.length / 2);
  return [words.slice(0, cut), words.slice(cut)];
}

export function Hero({ eyebrow, headline, intro }: Props) {
  const lines = splitHeadline(headline);
  let wordIndex = 0;
  return (
    <HeroAurora>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.headline}>
          {lines.map((words, lineIndex) => (
            <span key={lineIndex}>
              {lineIndex > 0 ? " " : null}
              <span className={styles.line} data-line={lineIndex}>
                {words.map((word, i) => (
                  <span key={i}>
                    {i > 0 ? " " : null}
                    <span className={styles.mask}>
                      <span
                        className={styles.word}
                        style={{ "--i": wordIndex++ } as CSSProperties}
                      >
                        {word}
                      </span>
                    </span>
                  </span>
                ))}
              </span>
            </span>
          ))}
        </h1>
        <div className={styles.intro}>
          {intro.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <SectionLink id="experience" className={styles.cue}>
          Scroll <span aria-hidden="true">↓</span>
        </SectionLink>
      </div>
    </HeroAurora>
  );
}
