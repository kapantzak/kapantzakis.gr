import { type CSSProperties, useId } from "react";
import Image from "next/image";
import type { Story } from "@/content/profile";
import { ExternalLink } from "./ExternalLink";
import styles from "./RoleStory.module.css";

// Body of a role's detail sheet: an intro, a full-bleed panel per contribution, then an optional
// timeline (decisions 99–107, 128–132).
export function RoleStory({ story }: { story: Story }) {
  const headingId = useId();
  const timelineHeadingId = useId();

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
      {story.contributions?.length ? (
        <section className={styles.contributions} aria-labelledby={headingId}>
          <h3 id={headingId} className={styles.heading}>
            {story.contributionsHeading ?? "Selected contributions"}
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
      ) : null}
      {story.timeline ? (
        <section
          className={styles.timeline}
          aria-labelledby={timelineHeadingId}
        >
          <h3 id={timelineHeadingId} className={styles.heading}>
            {story.timeline.heading}
          </h3>
          <ol className={styles.stages}>
            {story.timeline.stages.map((stage) => (
              <li key={stage.title} className={styles.stage}>
                <h4 className={styles.stageTitle}>{stage.title}</h4>
                <p>{stage.body}</p>
                <ul className={styles.tags} aria-label="Technologies">
                  {stage.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </>
  );
}
