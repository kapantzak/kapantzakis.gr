import { type CSSProperties, useId } from "react";
import Image from "next/image";
import type { Story } from "@/content/profile";
import { ExternalLink } from "./ExternalLink";
import styles from "./RoleStory.module.css";

// Body of a role's detail sheet: an intro, then a full-bleed panel per contribution (decisions 99–107).
export function RoleStory({ story }: { story: Story }) {
  const headingId = useId();

  return (
    <>
      <div className={styles.intro}>
        {story.intro.map((part) => (
          <div key={part.label} className={styles.introPart}>
            <h3 className={styles.introLabel}>{part.label}</h3>
            <p>{part.text}</p>
          </div>
        ))}
      </div>
      <section className={styles.contributions} aria-labelledby={headingId}>
        <h3 id={headingId} className={styles.heading}>
          Selected contributions
        </h3>
        <ol className={styles.list}>
          {story.contributions.map((item, index) => (
            <li
              key={item.title}
              className={styles.panel}
              // Odd panels mirror the band's visual, even ones repeat it (decision 103).
              data-side={index % 2 === 0 ? "left" : "right"}
              style={{ "--tint": item.tint } as CSSProperties}
            >
              <div className={styles.text}>
                <h4 className={styles.title}>{item.title}</h4>
                <p>{item.body}</p>
                {item.links ? (
                  <ul className={styles.links}>
                    {item.links.map((link) => (
                      <li key={link.url}>
                        <ExternalLink href={link.url}>
                          {link.label}
                        </ExternalLink>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <div className={styles.visual} aria-hidden="true">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="(min-width: 48rem) 60vw, 100vw"
                  className={styles.visualImage}
                />
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
