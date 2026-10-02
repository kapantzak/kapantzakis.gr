import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { PageMain } from "@/components/PageMain";
import { Prose } from "@/components/Prose";
import { Section } from "@/components/Section";
import { Timeline, type TimelineEntry } from "@/components/Timeline";
import { profile } from "@/content/profile";

export const metadata: Metadata = {
  title: "About",
  description: `${profile.role} based in Thessaloniki, Greece.`,
  alternates: { canonical: "/about" },
};

const experience: TimelineEntry[] = profile.experience.map((role) => ({
  id: `${role.org}-${role.period.start}`,
  period: role.period,
  title: role.title,
  org: role.org,
  orgUrl: role.orgUrl,
  meta: role.stack.length > 0 ? role.stack.join(" · ") : undefined,
}));

const education: TimelineEntry[] = profile.education.map((degree) => ({
  id: `${degree.institution}-${degree.period.start}`,
  period: degree.period,
  title: degree.degree,
  org: degree.institution,
  link: degree.thesis,
}));

const community: TimelineEntry[] = profile.community.map((entry) => ({
  id: `${entry.org}-${entry.period.start}`,
  period: entry.period,
  title: entry.title,
  org: entry.org,
  orgUrl: entry.orgUrl,
  description: entry.summary,
}));

export default function AboutPage() {
  return (
    <PageMain accent="lime">
      <PageHeader eyebrow="02 / About" title="About" />
      <Prose>
        {profile.intro.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </Prose>
      <Section index="01" title="Experience">
        <Timeline entries={experience} />
      </Section>
      <Section index="02" title="Education">
        <Timeline entries={education} />
      </Section>
      <Section index="03" title="Community">
        <Timeline entries={community} />
      </Section>
    </PageMain>
  );
}
