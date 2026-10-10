import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { PageAnalytics } from "@/components/PageAnalytics";
import { profile } from "@/content/profile";
import { regionPendingScript } from "@/lib/region-entry";
import { sheetRoutes } from "@/lib/sheets";
import { SITE_URL } from "@/lib/site";
import { HOME_TITLE, TITLE_TEMPLATE } from "@/lib/titles";
import { bodyFont, displayFont } from "@/styles/fonts";
import "@/styles/tokens.css";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: TITLE_TEMPLATE,
  },
  description: profile.headline,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <head>
        {/* Runs before <body> is parsed, so a section path's first frame is not the top of the page (decision 186). */}
        <script dangerouslySetInnerHTML={{ __html: regionPendingScript() }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Nav />
        {children}
        <Footer />
        <PageAnalytics sheetRoutes={sheetRoutes(profile)} />
      </body>
    </html>
  );
}
