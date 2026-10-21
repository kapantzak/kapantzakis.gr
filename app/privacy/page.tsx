import type { Metadata } from "next";
import { PageMain } from "@/components/PageMain";
import { profile } from "@/content/profile";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How this site uses Google Analytics and cookies, and your choices.",
  alternates: { canonical: "/privacy" },
};

// Privacy and cookies on one page (decision 221); the facts follow section 32 and decisions 216–227.
export default function Privacy() {
  const email = <a href={`mailto:${profile.email}`}>{profile.email}</a>;
  return (
    <PageMain>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Privacy and cookies</p>
        <h1 className={styles.title}>Privacy</h1>
        <p className={styles.lead}>
          This site counts visits with Google Analytics, and only if you accept.
          Nothing else about you is collected.
        </p>
      </header>
      <div className={styles.body}>
        <section>
          <h2>Who runs this site</h2>
          <p>
            {profile.name}, who is responsible for this site and for the data
            described here. You can reach me at {email}.
          </p>
        </section>
        <section>
          <h2>What is collected</h2>
          <p>
            If you choose Accept on the cookie banner, the site loads Google
            Analytics 4. It records the pages you view, the links to other sites
            you follow, and general information such as your approximate
            location, device and browser. If you choose Reject, or make no
            choice, nothing is loaded from Google and no analytics cookie is
            set.
          </p>
          <p>Google Analytics sets two cookies, each kept for up to 2 years:</p>
          <ul>
            <li>
              <code>_ga</code>, to tell one visitor from another;
            </li>
            <li>
              <code>_ga_&lt;ID&gt;</code>, to keep track of a visit.
            </li>
          </ul>
          <p>
            Google Analytics does not log or store the IP addresses of visitors
            from the EU: it uses them only to work out an approximate location,
            then discards them. Advertising features are switched off.
          </p>
          <p>
            Your choice itself is kept in your browser&apos;s local storage for
            6 months, after which the banner asks again.
          </p>
        </section>
        <section>
          <h2>Why</h2>
          <p>
            To see which pages are read and which links are followed. The legal
            basis is your consent. Refusing changes nothing else on the site.
          </p>
        </section>
        <section>
          <h2>Changing your mind</h2>
          <p>
            Use Cookie settings at the bottom of any page. Withdrawing consent
            deletes the analytics cookies and stops further collection; it does
            not affect what was collected before.
          </p>
        </section>
        <section>
          <h2>How long the data is kept</h2>
          <p>Google Analytics keeps the collected data for 14 months.</p>
        </section>
        <section>
          <h2>Who else sees it</h2>
          <p>
            Google processes the data on my behalf. It may transfer data to the
            United States, under the EU–US Data Privacy Framework.
          </p>
        </section>
        <section>
          <h2>Your rights</h2>
          <p>
            You can ask to access, correct or erase your data, to restrict or
            object to its processing, and to receive it in a portable form.
            Write to {email}. You can also complain to the Hellenic Data
            Protection Authority (
            <a href="https://www.dpa.gr" rel="noopener noreferrer">
              dpa.gr
            </a>
            ).
          </p>
        </section>
        <p className={styles.updated}>Last updated 21 October 2026.</p>
      </div>
    </PageMain>
  );
}
