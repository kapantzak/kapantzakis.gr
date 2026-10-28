import type { StaticImageData } from "next/image";
import adzunaHome from "@/assets/brand/adzuna-home.png";
import authEconomics from "@/assets/brand/auth-economics.webp";
import authOntology from "@/assets/brand/auth-ontology.webp";
import adzunaLogo from "@/assets/brand/adzuna-logo.svg";
import epsilonnetHome from "@/assets/brand/epsilonnet-home.webp";
import epsilonnetLogo from "@/assets/brand/epsilonnet-logo.svg";
import hoohooliHome from "@/assets/brand/hoohooli-home.webp";
import hoohooliLogo from "@/assets/brand/hoohooli-logo.svg";
import netdataDashboard from "@/assets/brand/netdata-dashboard.png";
import netdataLogo from "@/assets/brand/netdata-logo.svg";
import skgjsHome from "@/assets/brand/skgjs-home.webp";
import skgjsLogo from "@/assets/brand/skgjs-logo.svg";
import skgjsJoin from "@/assets/stories/skgjs/join.webp";
import skgjsTalk from "@/assets/stories/skgjs/talk.webp";
import skroutzHome from "@/assets/brand/skroutz-home.webp";
import skroutzLogo from "@/assets/brand/skroutz-logo.svg";
import uomAttendance from "@/assets/brand/uom-attendance.webp";
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
import hoohooliCatalogue from "@/assets/stories/hoohooli/catalogue.webp";
import hoohooliAccount from "@/assets/stories/hoohooli/wordpress-account.webp";
import hoohooliProduct from "@/assets/stories/hoohooli/product.webp";
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
/** A project of the user's own, outside employment (decision 242). */
export type Project = {
  /** Its sheet's path segment, unique within its group (decision 162). */
  slug: string;
  name: string;
  /** The live site; never a private repository (decision 244). */
  url: string;
  /** What the project is, shown as the sheet's subtitle (decision 251). */
  descriptor: string;
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
  story?: Story;
};
export type SocialLink = { label: string; url: string };

export type Profile = {
  name: string;
  role: string;
  headline: string;
  intro: string[];
  email: string;
  experience: Role[];
  projects: Project[];
  education: Degree[];
  community: CommunityRole[];
  social: SocialLink[];
};

export const profile: Profile = {
  name: "John Kapantzakis",
  role: "Senior software engineer",
  headline: "I build things for the web.",
  intro: [
    "I'm a software engineer from Greece, with 12+ years of experience. Currently, I work with React and AI agents.",
    "I co-organise SKG JS, Thessaloniki’s JavaScript community meetups, bringing developers together to learn, share, and connect. I’ve also written about software engineering on Scalable Path, Medium, dev.to, and the Skroutz Engineering blog.",
  ],
  email: "kapantzak@gmail.com",
  experience: [
    {
      slug: "netdata",
      org: "Netdata",
      orgUrl: "https://www.netdata.cloud/",
      title: "Senior frontend engineer",
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
            text: "At Netdata, I work on the frontend of Netdata Cloud, building product experiences and evolving the architecture of a large React application. My work spans frontend architecture, AI-powered features, infrastructure configuration and performance optimization.",
          },
        ],
        contributions: [
          {
            title: "AI-powered observability",
            body: "Built frontend capabilities for Netdata's AI assistant, evolving it from a basic chat interface to persistent LLM conversations powered by Netdata-specific tools and investigation workflows. I also implemented frontend support for Model Context Protocol (MCP), allowing users to connect external tooling.",
            image: aiChat,
            tint: "#dff3e4",
          },
          {
            title: "AI Insights and investigation reports",
            body: "Helped build an end-to-end reporting experience for infrastructure investigations, including report generation, rendering and scheduling. This work brings investigation and reporting capabilities together in a cohesive product experience.",
            image: aiInsights,
            tint: "#d7eeee",
          },
          {
            title: "Dynamic configuration system",
            body: "Built the foundational Dynamic Configurations UI and continued evolving it to support complex, dynamically generated configuration forms, using the react-jsonschema-form library.",
            image: dyncfg,
            tint: "#e9f3d6",
          },
          {
            title: "Frontend performance engineering",
            body: "Optimized data processing algorithms and React rendering to improve performance and eliminate unnecessary component remounts.",
            image: performance,
            tint: "#d6eaf2",
          },
          {
            title: "Alerting and scheduling",
            body: "Contributed to alert configuration, silencing, recurring schedules, and historical alert evaluation.",
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
            body: "Built the integrations onboarding experience and contributed to its continued evolution.",
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
            body: "Improved the frontend testing and CI workflow through test reliability fixes and Jest test sharding. The reported CI runtime dropped by about 60%.",
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
      title: "Senior frontend engineer",
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
            body: "Both pull requests shipped in Turbo 7. The release announcement thanked me, together with another contributor, for the new frame events.",
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
  projects: [
    {
      slug: "hoohooli",
      name: "hoohooli.gr",
      url: "https://hoohooli.gr/",
      descriptor: "Headless e-commerce storefront",
      period: { start: "Dec 2025" },
      stack: ["Next.js", "React", "TypeScript", "WooCommerce"],
      // From hoohooli.gr: the official logo, rose-50 band, the button rose and the home screen (decision 250).
      brand: {
        logo: hoohooliLogo,
        background: "#fff1f2",
        accent: "#f43f5e",
        link: "#f43f5e",
        tone: "light",
        visual: hoohooliHome,
      },
      // Screenshots of the live shop, approved by the user (decisions 247, 252).
      story: {
        intro: [
          {
            label: "hoohooli",
            text: "hoohooli is my family's business: a Greek online shop selling handmade clothes and accessories for babies and toddlers. It started as a WordPress and WooCommerce monolith that handled everything, from the catalogue to checkout.",
          },
          {
            label: "My role",
            text: "I designed and built the new storefront: a Next.js app for the catalogue, with WordPress kept as a headless backend on its own subdomain for checkout, payments and customer accounts.",
          },
        ],
        contributionsHeading: "What I built",
        contributions: [
          {
            title: "Splitting the monolith",
            body: "Moved the product catalogue to a Next.js App Router storefront on Vercel that reads products and categories from the WooCommerce REST API on the server. WordPress moved to an API subdomain, where it still runs checkout, payments and customer accounts.",
            image: hoohooliCatalogue,
            tint: "#ffe4e6",
          },
          {
            title: "One shop, two apps",
            body: "Carried the cart from the storefront to WooCommerce checkout. A server-side proxy to the CoCart API keeps the store's keys off the browser and hands the cart over by its key. I restyled the remaining WordPress pages to match the new UI, so customers never feel they have left the shop.",
            image: hoohooliAccount,
            tint: "#fef3c7",
          },
          {
            title: "A fast, findable catalogue",
            body: "Cut product API responses from about 2.4 MB to about 400 KB, bringing them under Next.js's 2 MB data-cache limit so catalogue data is cached and revalidated every minute. Added indexable category pages, a sitemap built from live data, and Product and breadcrumb structured data.",
            image: hoohooliProduct,
            tint: "#f5f0eb",
          },
        ],
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
      // The logo's orange-gold; the visual is an illustration of the thesis application (decisions 152, 198).
      brand: {
        background: "#ffffff",
        accent: "#f6a800",
        link: "#f6a800",
        tone: "light",
        visual: uomAttendance,
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
      // The program was renamed in 2018, so the link goes to its successor (decision 187).
      program: {
        label: "Successor program (AUTh)",
        url: "https://deps.csd.auth.gr/en/",
      },
      thesis: {
        label: "Thesis (Greek)",
        url: "https://ikee.lib.auth.gr/record/115789/files/kapantzakes.pdf",
      },
      // A tint of the logo's red, which fails 4.5:1 as an accent; the visual is an
      // illustration of the thesis's ontology (decisions 192, 193).
      brand: {
        background: "#ffffff",
        accent: "#e0675c",
        link: "#e0675c",
        tone: "light",
        visual: authOntology,
      },
      story: {
        intro: [
          {
            label: "The program",
            text: "Informatics and Management was an interdepartmental master's program at Aristotle University of Thessaloniki, run by the Departments of Informatics and Economic Sciences since 2003. It trained professionals in information systems and their use in managing businesses and organisations. In 2018 it evolved into the MSc in Management and Information Systems.",
          },
          {
            label: "My thesis",
            text: "My thesis, “Applying Semantic Web technologies to knowledge management in e-commerce”, explored how ontologies can organise the knowledge an online shop depends on. I developed E-Shop, an OWL ontology built in Protégé on an existing e-commerce ontology and modelled around the online payment process, describing buyers, shops and the parties a payment involves.",
          },
        ],
      },
    },
    {
      slug: "bsc-economic-science",
      institution: "Aristotle University of Thessaloniki",
      degree: "BSc in Economic Science",
      period: { start: "2001", end: "2006" },
      program: {
        label: "School of Economics (AUTh)",
        url: "https://www.econ-auth.gr/en/",
      },
      // The same brand as the AUTh MSc; the visual is an illustration of economic theory (decisions 203, 204).
      brand: {
        background: "#ffffff",
        accent: "#e0675c",
        link: "#e0675c",
        tone: "light",
        visual: authEconomics,
      },
      story: {
        intro: [
          {
            label: "The school",
            text: "The School of Economics of Aristotle University of Thessaloniki is the university's largest school, founded in 1928 as the School of Economics and Political Sciences.",
          },
          {
            label: "My division",
            text: "I chose the Economic Theory and Policy division, which covers the core of economics: mathematics and statistics, micro- and macroeconomics, economic analysis and policy, monetary economics and industrial organisation.",
          },
        ],
      },
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
      // Both panels show illustrations built from the Meetup pages (decisions 208–211).
      story: {
        intro: [
          {
            label: "The community",
            text: "SKG JS, the Thessaloniki JavaScript Meetup, is a community for developers of all levels: a friendly, inclusive space to socialise, learn and grow, with talks on JavaScript and software engineering.",
          },
          {
            label: "My role",
            text: "I co-organise the meetups, bringing developers together to learn, share and connect.",
          },
        ],
        contributionsHeading: "Highlights",
        contributions: [
          {
            title: "What's new in React 19",
            body: "At Meetup #3, on 25 April 2025 at OKThess, I gave a high-level tour of the most important updates in React 19 and how they change modern frontend development, with practical examples of how they make developers' lives easier.",
            image: skgjsTalk,
            tint: "#fdf6c9",
            links: [
              {
                label: "Meetup #3",
                url: "https://www.meetup.com/skg-js/events/307229886/",
              },
            ],
          },
          {
            title: "Between meetups",
            body: "Events are announced on Meetup, where you can RSVP; between meetups, the conversation continues on the community's Discord server.",
            image: skgjsJoin,
            tint: "#f1efe6",
            links: [
              {
                label: "SKG JS on Meetup",
                url: "https://www.meetup.com/skg-js/",
              },
              {
                label: "SKG JS on Discord",
                url: "https://discord.gg/dQY7TPUTBb",
              },
            ],
          },
        ],
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
