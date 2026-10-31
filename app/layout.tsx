import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ConsentBanner } from "@/components/ConsentBanner";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { PageAnalytics } from "@/components/PageAnalytics";
import { profile } from "@/content/profile";
import { gaId } from "@/lib/gtag";
import { regionPendingScript } from "@/lib/region-entry";
import { sheetPaths } from "@/lib/sheets";
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
  // One thumbnail for the whole site (decision 254): every route inherits this unless it sets its own.
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: profile.name,
    title: HOME_TITLE,
    description: profile.headline,
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: profile.headline,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // Without an ID (local runs, previews) there is no analytics at all (decision 222).
  const id = gaId();
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
        {id && (
          <>
            <PageAnalytics gaId={id} sheetPaths={sheetPaths(profile)} />
            <ConsentBanner gaId={id} />
          </>
        )}
      </body>
    </html>
  );
}
