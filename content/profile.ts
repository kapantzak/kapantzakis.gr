import type { StaticImageData } from "next/image";
import netdataDashboard from "@/assets/brand/netdata-dashboard.png";
import netdataLogo from "@/assets/brand/netdata-logo.svg";
import type { Period } from "@/lib/period";

/** An employer's own look for the top of its detail sheet (decisions 48–53). */
export type Brand = {
  /** The official light-on-dark logo, used unchanged. */
  logo: StaticImageData;
  background: string;
  accent: string;
  /** Decorative brand art for the band (decisions 55–59). */
  visual?: StaticImageData;
};

export type Role = {
  org: string;
  orgUrl?: string;
  title: string;
  period: Period;
  stack: string[];
  brand?: Brand;
};
export type Degree = {
  institution: string;
  degree: string;
  period: Period;
  thesis?: { label: string; url: string };
};
export type CommunityRole = {
  org: string;
  orgUrl: string;
  title: string;
  period: Period;
  summary: string;
};
export type SocialLink = { label: string; url: string };

export type Profile = {
  name: string;
  role: string;
  headline: string;
  intro: string[];
  email: string;
  experience: Role[];
  education: Degree[];
  community: CommunityRole[];
  social: SocialLink[];
};

export const profile: Profile = {
  name: "John Kapantzakis",
  role: "Senior frontend engineer",
  headline: "I build things for the web.",
  intro: [
    "I'm a frontend engineer based in Thessaloniki, Greece. I've been building for the web since 2008, and these days I work mostly with TypeScript, React and Next.js.",
    "I co-organise SKG JS, a JavaScript community in Thessaloniki, and I write about frontend engineering here and on DEV.",
  ],
  email: "kapantzak@gmail.com",
  experience: [
    {
      org: "Netdata",
      orgUrl: "https://www.netdata.cloud/",
      title: "Senior software engineer",
      period: { start: "Feb 2023" },
      stack: ["JavaScript", "React", "AI coding agents"],
      // From netdata.cloud: page background, logo green and the hero's dashboard.
      brand: {
        logo: netdataLogo,
        background: "#020503",
        accent: "#00ab44",
        visual: netdataDashboard,
      },
    },
    {
      org: "Adzuna",
      orgUrl: "https://www.adzuna.co.uk/",
      title: "Senior frontend developer",
      period: { start: "Feb 2022", end: "Jan 2023" },
      stack: ["JavaScript", "React", "Next.js"],
    },
    {
      org: "Skroutz",
      orgUrl: "https://www.skroutz.gr/",
      title: "Software engineer",
      period: { start: "Jun 2020", end: "Jan 2022" },
      stack: ["JavaScript", "React", "Ruby on Rails"],
    },
    {
      org: "EpsilonNet",
      orgUrl: "https://www.epsilonnet.gr/",
      title: "Web developer",
      period: { start: "Sep 2014", end: "May 2020" },
      stack: ["JavaScript", "TypeScript", "ASP.NET", "C#"],
    },
    {
      org: "Independent",
      title: "Web developer (hobbyist)",
      period: { start: "2008", end: "2014" },
      stack: ["HTML", "CSS", "jQuery", "PHP", "MySQL", "Joomla"],
    },
  ],
  education: [
    {
      institution: "University of Macedonia",
      degree: "MSc in Applied Informatics",
      period: { start: "2015", end: "2018" },
      thesis: {
        label: "Thesis (English)",
        url: "https://dspace.lib.uom.gr/bitstream/2159/22942/4/KapantzakisIoannisMsc2018.pdf",
      },
    },
    {
      institution: "Aristotle University of Thessaloniki",
      degree: "MSc in Informatics and Management",
      period: { start: "2008", end: "2010" },
    },
    {
      institution: "Aristotle University of Thessaloniki",
      degree: "BSc in Economic Science",
      period: { start: "2001", end: "2006" },
    },
  ],
  community: [
    {
      org: "SKG JS",
      orgUrl: "https://www.linkedin.com/company/skg-js/",
      title: "Co-organiser",
      period: { start: "Apr 2025" },
      summary:
        "Organising meetups and talks for the JavaScript community in Thessaloniki.",
    },
  ],
  social: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/johnkapantzakis" },
    { label: "GitHub", url: "https://github.com/kapantzak" },
    { label: "DEV", url: "https://dev.to/kapantzak" },
    {
      label: "Stack Overflow",
      url: "https://stackoverflow.com/users/1221792/kapantzak",
    },
    { label: "GitLab", url: "https://gitlab.com/kapantzak" },
  ],
};
