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
import uomCampus from "@/assets/brand/uom-campus.webp";
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
import reduxUi from "@/assets/stories/epsilonnet/redux.webp";
import typescriptWebpack from "@/assets/stories/epsilonnet/typescript-webpack.webp";
import unitTests from "@/assets/stories/epsilonnet/unit-tests.webp";
import essDevCli from "@/assets/stories/epsilonnet/cli.webp";
import attendanceMobile from "@/assets/stories/msc/mobile-app.webp";
import attendanceWeb from "@/assets/stories/msc/web-app.webp";
import attendanceApi from "@/assets/stories/msc/web-api.webp";
import type { Period } from "@/lib/period";

/** An organisation's own look for the top of its detail sheet (decisions 48–53, 87). */
export type Brand = {
  /** The official logo, used unchanged; it must read on `background`. Without one, the title stays text (decision 151). */
  logo?: StaticImageData;
  background: string;
  accent: string;
  /** Fills the website link on the band (decision 68). */
  link: string;
  /** Which text colours the band takes: the dark page's or the light sheet's (decision 64). */
  tone: "light" | "dark";
  /** Decorative brand art for the band (decisions 55–59). */
  visual?: StaticImageData;
  /** The name as two lines set beside a symbol-only logo; it then names the sheet (decisions 92, 93). Needs a logo. */
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
  /** Defaults to "Selected contributions" (decision 156). */
  contributionsHeading?: string;
  contributions?: Contribution[];
  /** Follows the contributions (decision 129). */
  timeline?: { heading: string; stages: Stage[] };
};

export type Role = {
  /** Its sheet's path segment, unique within its group (decision 162). */
  slug: string;
  org: string;
  orgUrl?: string;
  title: string;
  period: Period;
  stack: string[];
  brand?: Brand;
  story?: Story;
};
export type Degree = {
  /** Its sheet's path segment, unique within its group (decision 162). */
  slug: string;
  institution: string;
  degree: string;
  period: Period;
  program?: { label: string; url: string };
  thesis?: { label: string; url: string };
  brand?: Brand;
  story?: Story;
};
export type CommunityRole = {
  /** Its sheet's path segment, unique within its group (decision 162). */
  slug: string;
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
      slug: "netdata",
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
      slug: "adzuna",
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
      slug: "skroutz",
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
      slug: "epsilonnet",
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
      // No screenshots of ESS exist, so the panels show generated illustrations (decision 141);
      // the CLI panel re-draws the user's own terminal screenshots (decision 145).
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
            title: "Async UI with Redux",
            body: "Turned parts of the interface into views that load and update asynchronously, with their state managed by Redux on the frontend.",
            image: reduxUi,
            tint: "#fde6dc",
            links: [
              {
                label: "Using Redux in a legacy ASP.NET Web Forms project",
                url: "https://dev.to/kapantzak/using-redux-in-a-legacy-asp-net-web-forms-project-1805",
              },
            ],
          },
          {
            title: "TypeScript and webpack",
            body: "Introduced TypeScript and webpack to the frontend code, adding type checking and a build step that bundles its modules.",
            image: typescriptWebpack,
            tint: "#fdeed6",
          },
          {
            title: "Unit tests, front and back",
            body: "Added unit tests on both sides of the product: Mocha and Chai for the frontend code, xUnit for the C# backend.",
            image: unitTests,
            tint: "#f8e2e0",
          },
          {
            title: "Developer productivity CLI tool",
            body: "Built a Node.js command-line tool that asks a few questions and generates the boilerplate a new form needs: the ASP.NET user control and its async handler, the TypeScript page script and Redux state, and the C# data models. Its templates are written in Handlebars.",
            image: essDevCli,
            tint: "#f7e8dc",
            links: [
              {
                label:
                  "Automating boilerplate code generation with Node.js and Handlebars",
                url: "https://dev.to/kapantzak/automating-boilerplate-code-generation-with-node-js-and-handlebars-2c09",
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
      slug: "msc-applied-informatics",
      institution: "University of Macedonia",
      degree: "MSc in Applied Informatics",
      period: { start: "2015", end: "2018" },
      program: {
        label: "MSc in Applied Informatics",
        url: "https://www.uom.gr/en/mai",
      },
      thesis: {
        label: "Thesis (English)",
        url: "https://dspace.lib.uom.gr/bitstream/2159/22942/4/KapantzakisIoannisMsc2018.pdf",
      },
      // The logo's orange-gold; the visual is a photo of the main building (decisions 152, 153).
      brand: {
        background: "#ffffff",
        accent: "#f6a800",
        link: "#f6a800",
        tone: "light",
        visual: uomCampus,
      },
      // The app screenshots are the user's own; the API image is an illustration (decisions 157–159).
      story: {
        intro: [
          {
            label: "The program",
            text: "The MSc in Applied Informatics was the first master's degree of the University of Macedonia's Department of Applied Informatics in Thessaloniki, running since 2003–2004. It builds a strong scientific foundation in informatics and applies it to economic, administrative and educational problems.",
          },
          {
            label: "My thesis",
            text: "My thesis, “Developing a web-based application for student attendance management”, set out to replace the paper list professors pass around at the start of each lecture, which takes longer the more students attend. I studied existing systems and designed one that needs no special hardware: the professor shows a QR code, students scan it with their phones, and the server checks that each scan comes from the classroom, on time.",
          },
        ],
        contributionsHeading: "The application",
        contributions: [
          {
            title: "Mobile app for students",
            body: "An Android app built with Ionic and Angular in TypeScript. Students sign in, see their enrolments and scan the QR code shown in class; the app asks them to confirm, then sends the scan to the API with the phone's location.",
            image: attendanceMobile,
            tint: "#fdf0cc",
            links: [
              {
                label: "kapantzak/AttendanceMobileApp",
                url: "https://github.com/kapantzak/AttendanceMobileApp",
              },
            ],
          },
          {
            title: "Web app for professors and students",
            body: "A React and TypeScript web client. Professors pick the current course and show a fresh QR code for the lecture; students and professors follow attendance per course, with charts of logged attendances against those still required.",
            image: attendanceWeb,
            tint: "#dce8f3",
            links: [
              {
                label: "kapantzak/AttendanceWeb",
                url: "https://github.com/kapantzak/AttendanceWeb",
              },
            ],
          },
          {
            title: "Web API",
            body: "An ASP.NET Core Web API in C#, with Entity Framework Core on SQL Server and JWT authentication. It generates each lecture's QR code with the course and its start time, and accepts a scan only if the device is within the classroom's range, the lecture started recently enough and the student is enrolled in the course.",
            image: attendanceApi,
            tint: "#fbe6cf",
            links: [
              {
                label: "kapantzak/AttendanceWebAPI",
                url: "https://github.com/kapantzak/AttendanceWebAPI",
              },
            ],
          },
        ],
      },
    },
    {
      slug: "msc-informatics-and-management",
      institution: "Aristotle University of Thessaloniki",
      degree: "MSc in Informatics and Management",
      period: { start: "2008", end: "2010" },
    },
    {
      slug: "bsc-economic-science",
      institution: "Aristotle University of Thessaloniki",
      degree: "BSc in Economic Science",
      period: { start: "2001", end: "2006" },
    },
  ],
  community: [
    {
      slug: "skgjs",
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
