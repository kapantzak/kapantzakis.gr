import type { StaticImageData } from "next/image";
import adzunaHome from "@/assets/brand/adzuna-home.png";
import adzunaLogo from "@/assets/brand/adzuna-logo.svg";
import epsilonnetHome from "@/assets/brand/epsilonnet-home.webp";
import epsilonnetLogo from "@/assets/brand/epsilonnet-logo.svg";
import netdataDashboard from "@/assets/brand/netdata-dashboard.png";
import netdataLogo from "@/assets/brand/netdata-logo.svg";
import skgjsHome from "@/assets/brand/skgjs-home.webp";
import skgjsLogo from "@/assets/brand/skgjs-logo.svg";
import skroutzHome from "@/assets/brand/skroutz-home.webp";
import skroutzLogo from "@/assets/brand/skroutz-logo.svg";
import aiChat from "@/assets/stories/netdata/ai-chat.webp";
import aiInsights from "@/assets/stories/netdata/ai-insights.webp";
import dyncfg from "@/assets/stories/netdata/dyncfg.webp";
import performance from "@/assets/stories/netdata/performance.webp";
import silencingRules from "@/assets/stories/netdata/silencing-rules.webp";
import infraKnowledge from "@/assets/stories/netdata/infra-knowledge.webp";
import integrations from "@/assets/stories/netdata/integrations.webp";
import scim from "@/assets/stories/netdata/scim.webp";
import githubCi from "@/assets/stories/netdata/github-ci.webp";
import platformDashboard from "@/assets/stories/adzuna/platform-dashboard.webp";
import chartsAndMaps from "@/assets/stories/adzuna/charts-and-maps.webp";
import explore from "@/assets/stories/adzuna/explore.webp";
import merchantDashboard from "@/assets/stories/skroutz/merchant-dashboard.webp";
import turboPr327 from "@/assets/stories/skroutz/turbo-pr-327.webp";
import turboPr367 from "@/assets/stories/skroutz/turbo-pr-367.webp";
import turbo7Announcement from "@/assets/stories/skroutz/turbo-7-announcement.webp";
import selfService from "@/assets/stories/epsilonnet/self-service.webp";
import type { Period } from "@/lib/period";

/** An organisation's own look for the top of its detail sheet (decisions 48–53, 87). */
export type Brand = {
  /** The official logo, used unchanged; it must read on `background`. */
  logo: StaticImageData;
  background: string;
  accent: string;
  /** Fills the website link on the band (decision 68). */
  link: string;
  /** Which text colours the band takes: the dark page's or the light sheet's (decision 64). */
  tone: "light" | "dark";
  /** Decorative brand art for the band (decisions 55–59). */
  visual?: StaticImageData;
  /** The name as two lines set beside a symbol-only logo; it then names the sheet (decisions 92, 93). */
  lockup?: [string, string];
};

/** A panel in a role's story (decisions 102–107). */
export type Contribution = {
  title: string;
  body: string;
  /** Decorative; a landscape, screen-like image (about 16:9), shown tilted like the brand visual. */
  image: StaticImageData;
  /** Light panel background; the sheet's paper text tokens must keep 4.5:1 on it (decision 104). */
  tint: string;
  /** External links listed under the text (decision 111). */
  links?: { label: string; url: string }[];
};

/** A step in a role's timeline (decisions 128–131). */
export type Stage = {
  title: string;
  body: string;
  tags: string[];
};

/** Rich content for a role's detail sheet (decisions 99–101, 128). */
export type Story = {
  intro: { label: string; text: string }[];
  contributions?: Contribution[];
  /** Follows the contributions (decision 129). */
  timeline?: { heading: string; stages: Stage[] };
};

export type Role = {
  org: string;
  orgUrl?: string;
  title: string;
  period: Period;
  stack: string[];
  brand?: Brand;
  story?: Story;
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
  brand?: Brand;
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
    "I'm a frontend engineer based in Thessaloniki, Greece, with 15+ years of experience. Currently, I mostly work with React and AI agents.",
    "I co-organise SKG JS, Thessaloniki’s JavaScript community, bringing developers together to learn, share, and connect. I’ve also written about frontend engineering on dev.to and Scalable Path.",
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
        link: "#00ab44",
        tone: "dark",
        visual: netdataDashboard,
      },
      // Screenshots of Netdata Cloud taken by the user (decision 108).
      story: {
        intro: [
          {
            label: "Netdata",
            text: "Netdata is an open-source, real-time observability platform that helps engineers monitor infrastructure, investigate anomalies, and troubleshoot performance issues. Its focus on high-resolution metrics, automated insights, and AI-assisted investigation makes it an exciting environment for building complex, data-intensive web applications.",
          },
          {
            label: "My role",
            text: "At Netdata, I work on the frontend of Netdata Cloud, building product experiences and evolving the architecture of a large React application. My work spans frontend architecture, AI-powered features, infrastructure configuration, performance optimization, and developer tooling.",
          },
        ],
        contributions: [
          {
            title: "AI-powered observability",
            body: "Contributed to the evolution of Netdata's AI assistant, from conversational interfaces and streaming responses to persistent conversations, AI-assisted alert configuration, and investigation workflows. I also implemented frontend support for Model Context Protocol (MCP), connecting AI experiences with external tools and services.",
            image: aiChat,
            tint: "#dff3e4",
          },
          {
            title: "AI Insights and investigation reports",
            body: "Helped build an end-to-end reporting experience for infrastructure investigations, including report generation, rendering, scheduling, email delivery, and the integration of operational log data. This work brings investigation and reporting capabilities together in a cohesive product experience.",
            image: aiInsights,
            tint: "#d7eeee",
          },
          {
            title: "Dynamic configuration system",
            body: "Built the foundational Dynamic Configurations UI and continued evolving it to support complex, dynamically generated configuration forms. This included reusable widgets, autocomplete, nested interfaces, password masking, and improvements to configuration editing and reliability.",
            image: dyncfg,
            tint: "#e9f3d6",
          },
          {
            title: "Frontend performance engineering",
            body: "Improved performance in data-intensive parts of Netdata Cloud, including node processing and grouping logic. Two hot-path optimizations replaced quadratic-time operations with linear-time alternatives, addressing a documented 12–15-second main-thread freeze in large environments.",
            image: performance,
            tint: "#d6eaf2",
          },
          {
            title: "Alerting and scheduling",
            body: "Contributed to alert configuration, silencing, recurring schedules, and historical alert evaluation. This work included advanced recurrence rules, timezone and daylight-saving considerations, and interfaces for exploring alert behavior over time.",
            image: silencingRules,
            tint: "#e2f1dd",
          },
          {
            title: "Infrastructure knowledge and AI context",
            body: "Implemented interfaces for managing infrastructure knowledge and AI memories, including Markdown editing with live preview, version history, diff comparison, restore, and save-conflict resolution.",
            image: infraKnowledge,
            tint: "#d9efe7",
          },
          {
            title: "Integrations and onboarding",
            body: "Built the integrations onboarding experience and contributed to its continued evolution. I also implemented onboarding flows that guide new users through connecting their infrastructure and getting started with monitoring.",
            image: integrations,
            tint: "#eef0d8",
          },
          {
            title: "Enterprise capabilities",
            body: "Contributed to enterprise identity and access features, including SCIM integration, SSO, role and room mappings, and rule-based room membership driven by infrastructure labels.",
            image: scim,
            tint: "#dae7f0",
          },
          {
            title: "Developer productivity and release engineering",
            body: "Improved the frontend testing and CI workflow through test reliability fixes, additional linting rules, and Jest test sharding. The reported CI runtime dropped by about 60%. I also contribute to the ongoing release process and use AI coding agents to accelerate implementation and refactoring while maintaining engineering oversight.",
            image: githubCi,
            tint: "#e0f2ea",
          },
        ],
      },
    },
    {
      org: "Adzuna",
      orgUrl: "https://www.adzuna.co.uk/",
      title: "Senior frontend developer",
      period: { start: "Feb 2022", end: "Jan 2023" },
      stack: ["JavaScript", "React", "Next.js"],
      // From adzuna.co.uk: header logo, brand green and the first screen.
      brand: {
        logo: adzunaLogo,
        background: "#ffffff",
        accent: "#279b37",
        link: "#279b37",
        tone: "light",
        visual: adzunaHome,
      },
      // The first image is Adzuna's public screenshot; the others are illustrations (decision 122).
      story: {
        intro: [
          {
            label: "Adzuna",
            text: "Adzuna is a job search engine used by more than 15 million jobseekers a month across 20 countries. The job ads it collects add up to a detailed picture of the labour market.",
          },
          {
            label: "My role",
            text: "I joined Adzuna to build a brand-new product, Labour Market Intelligence, which turns that data into insight about the state of the labour market. We were a team of three, a product manager and two developers. Work moved quickly, and the collaboration within the team was exceptional.",
          },
        ],
        contributions: [
          {
            title: "A product from zero",
            body: "Labour Market Intelligence didn’t exist when I joined. Together with a product manager and another developer, we built it from the ground up on Next.js, and we shipped it in less than a year.",
            image: platformDashboard,
            tint: "#e4f2e0",
            links: [
              {
                label: "The product on adzuna.co.uk",
                url: "https://www.adzuna.co.uk/adzuna-intelligence/",
              },
            ],
          },
          {
            title: "Charts and maps",
            body: "The product is built around data visualisation. Charts and maps present Adzuna’s labour market data, so users can see demand, salaries and trends across regions at a glance.",
            image: chartsAndMaps,
            tint: "#edf4dc",
          },
          {
            title: "Exploring the labour market",
            body: "Users can search the data and group and filter it by location, sector, salary and many other dimensions, to answer their own questions about the labour market in different countries.",
            image: explore,
            tint: "#ddeee6",
          },
        ],
      },
    },
    {
      org: "Skroutz",
      orgUrl: "https://www.skroutz.gr/",
      title: "Software engineer",
      period: { start: "Jun 2020", end: "Jan 2022" },
      stack: ["JavaScript", "React", "Ruby on Rails", "Hotwire"],
      // From skroutz.gr: header logo (recoloured white), brand orange and primary yellow,
      // and a signed-out screenshot of the home page.
      brand: {
        logo: skroutzLogo,
        background: "#f68b24",
        accent: "#f68b24",
        link: "#ffb800",
        tone: "light",
        visual: skroutzHome,
      },
      // Turbo images are captures of public pages; the dashboard is an illustration (decisions 113, 114).
      story: {
        intro: [
          {
            label: "Skroutz",
            text: "Skroutz is one of Greece’s leading e-commerce marketplaces, connecting consumers with merchants through an online shopping platform.",
          },
          {
            label: "My role",
            text: "I worked in the Partners department, building and maintaining the tools merchants use to run their business on the marketplace. Working in an established engineering team strengthened my foundations in Git workflows, code review, collaborative development and maintainable code.",
          },
        ],
        contributions: [
          {
            title: "Merchant platform",
            body: "Developed and maintained features for the platform where merchants monitor orders, track payments and manage their day-to-day activities. Interfaces were server-rendered with Rails forms and Hotwire Turbo, with React for selected views, keeping the application interactive without a client-heavy architecture.",
            image: merchantDashboard,
            tint: "#fde8d2",
          },
          {
            title: "The turbo:frame-render event",
            body: "Introduced the turbo:frame-render event to Hotwire Turbo, so applications can respond when a Turbo Frame finishes rendering, with access to the fetch response that produced it.",
            image: turboPr327,
            tint: "#fdf0cc",
            links: [
              {
                label: "PR #327 on GitHub",
                url: "https://github.com/hotwired/turbo/pull/327",
              },
            ],
          },
          {
            title: "Fetch events that know their target",
            body: "Added the target element to Turbo’s fetch request and response events, making it easier to handle them at the form or frame that started the request.",
            image: turboPr367,
            tint: "#fbe2d6",
            links: [
              {
                label: "PR #367 on GitHub",
                url: "https://github.com/hotwired/turbo/pull/367",
              },
            ],
          },
          {
            title: "Recognised in the Turbo 7 release",
            body: "Both pull requests shipped in Turbo 7. The release announcement thanked me, together with Sean Doyle, for the new frame events.",
            image: turbo7Announcement,
            tint: "#f5ead6",
            links: [
              {
                label: "Turbo 7 announcement",
                url: "https://world.hey.com/hotwired/turbo-7-0dd7a27f",
              },
              {
                label: "Hotwire Turbo on GitHub",
                url: "https://github.com/hotwired/turbo",
              },
            ],
          },
        ],
      },
    },
    {
      org: "EpsilonNet",
      orgUrl: "https://www.epsilonnet.gr/",
      title: "Full stack developer",
      period: { start: "Sep 2014", end: "May 2020" },
      stack: ["JavaScript", "TypeScript", "ASP.NET", "C#"],
      // From epsilonnet.gr: logo (traced from its PNG), the logo's orange-red and the first screen.
      brand: {
        logo: epsilonnetLogo,
        background: "#ffffff",
        accent: "#f04e23",
        link: "#f04e23",
        tone: "light",
        visual: epsilonnetHome,
      },
      // The panel shows an illustration, since the only public ESS image is too small (decision 135).
      story: {
        intro: [
          {
            label: "EpsilonNet",
            text: "EpsilonNet is a Greek software company. It builds ERP, CRM, retail, HR and business intelligence software for businesses, and also works in digital content and education.",
          },
          {
            label: "My role",
            text: "I worked on Epsilon ESS, a web platform that companies use to manage their interactions with their employees. I joined as a junior web designer and left as a full stack developer, responsible for the product’s frontend.",
          },
        ],
        contributions: [
          {
            title: "Epsilon ESS",
            body: "Epsilon ESS is EpsilonNet’s Employee Self Service platform. I worked on it for almost six years, from its HTML and CSS to its ASP.NET backend.",
            image: selfService,
            tint: "#fde6dc",
            links: [
              {
                label: "Epsilon ESS on epsilonnet.gr",
                url: "https://epsilonnet.gr/proionta/epsilon-ess/",
              },
            ],
          },
        ],
        timeline: {
          heading: "From web designer to full stack developer",
          stages: [
            {
              title: "Junior web designer",
              body: "I started by designing mock-ups in Adobe Photoshop and turning them into HTML and CSS.",
              tags: ["Photoshop", "HTML", "CSS"],
            },
            {
              title: "Going deeper with jQuery",
              body: "I dug deeper into jQuery and brought new techniques into the codebase, such as a new menu.",
              tags: ["JavaScript", "jQuery"],
            },
            {
              title: "Into the backend",
              body: "When a senior backend developer left, I started working on the C# code, first with small changes such as translations. After a few months, I was contributing to more advanced parts of the backend.",
              tags: ["C#", "ASP.NET"],
            },
            {
              title: "From forms to APIs",
              body: "I turned parts of the frontend from server-rendered forms into content loaded with AJAX calls, from backend APIs that I built in ASP.NET and C#.",
              tags: ["AJAX", "ASP.NET", "C#"],
            },
            {
              title: "Introducing TypeScript",
              body: "I introduced TypeScript next to the existing jQuery code and replaced parts of it over time, to enforce type safety and reduce runtime errors.",
              tags: ["TypeScript", "jQuery"],
            },
            {
              title: "Full stack developer",
              body: "By the time I left, I was responsible for the frontend and implemented all features end to end, from the backend to the frontend, except for the SQL queries. I also built CLI tools that automate parts of development.",
              tags: ["TypeScript", "ASP.NET", "C#", "CLI tools"],
            },
          ],
        },
      },
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
      org: "Thessaloniki JavaScript Meetup",
      orgUrl: "https://skgjs.gr/",
      title: "Co-organiser",
      period: { start: "Apr 2025" },
      summary:
        "Organising meetups and talks for the JavaScript community in Thessaloniki.",
      // From skgjs.gr: the square logo, its js-black and js-yellow CSS tokens and the first screen.
      brand: {
        logo: skgjsLogo,
        background: "#1a1a1a",
        accent: "#f7dd3e",
        link: "#f7dd3e",
        tone: "dark",
        visual: skgjsHome,
        lockup: ["Thessaloniki", "JavaScript Meetup"],
      },
    },
  ],
  social: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/johnkapantzakis" },
    { label: "GitHub", url: "https://github.com/kapantzak" },
    { label: "DEV.TO", url: "https://dev.to/kapantzak" },
    {
      label: "Stack Overflow",
      url: "https://stackoverflow.com/users/1221792/kapantzak",
    },
    { label: "OnlyNerds", url: "https://lnk.onlynerds.club/kapantzak" },
  ],
};
