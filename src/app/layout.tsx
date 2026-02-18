import type { Metadata } from "next";
import DevelopmentBanner from "@/components/DevelopmentBanner";
import Navigation from "@/components/Navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import PWARegister from "@/components/PWARegister";
import LayoutErrorBoundary from "@/components/LayoutErrorBoundary";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://accountability-dashboard.pages.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Accountability Dashboard | Track Congressional Voting Records",
    template: "%s | Accountability Dashboard",
  },
  description: "Tracking power. Protecting democracy. Monitor all three branches of government with transparent, publicly-sourced data. See who funds them, how they vote, and who they really represent.",
  keywords: [
    "congressional accountability",
    "campaign finance",
    "voting records",
    "political transparency",
    "democracy",
    "government oversight",
    "representative tracking",
    "PAC donations",
    "political corruption",
    "congressional accountability",
  ],
  authors: [{ name: "Aria Labs" }],
  creator: "Aria Labs",
  publisher: "Aria Labs",
  applicationName: "Accountability Dashboard",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Accountability Dashboard",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "Accountability Dashboard | Track Congressional Voting Records",
    description: "Monitor all three branches of government with transparent data. See who funds them, how they vote, and who they really represent.",
    siteName: "Accountability Dashboard",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Accountability Dashboard - Tracking power, protecting democracy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Accountability Dashboard | Track Congressional Voting Records",
    description: "Monitor all three branches of government with transparent data. See who funds them, how they vote, and who they really represent.",
    images: ["/og-image.png"],
    creator: "@arialabs",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Accountability Dashboard",
    description: "Tracking power. Protecting democracy. Monitor all three branches of government with transparent data.",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: [
      "https://twitter.com/arialabs",
      "https://github.com/arialabs/accountability-dashboard",
    ],
    foundingDate: "2026",
    founder: {
      "@type": "Organization",
      name: "Aria Labs",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Accountability Dashboard",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/congress?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Accountability" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="min-h-screen">
        <PWARegister />
        <LayoutErrorBoundary>
          <DevelopmentBanner />
          <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <a href="/" className="text-lg sm:text-xl font-bold text-slate-900 hover:text-blue-600 transition truncate">
                  🏛️ <span className="hidden xs:inline">Accountability Dashboard</span><span className="inline xs:hidden">Dashboard</span>
                </a>
                <Navigation />
              </div>
            </div>
          </nav>
          <Breadcrumbs />
          <main className="bg-slate-50">{children}</main>
          <footer className="bg-white border-t border-slate-200 py-12 mt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 leading-relaxed space-y-4">
              <p className="font-semibold text-slate-700 text-sm sm:text-base">Built by Aria Labs</p>
              <p className="text-sm sm:text-base">Data from Congress.gov, Voteview, and OpenFEC</p>
              <p className="text-sm sm:text-base">Democracy shouldn't be paywalled. This is open source.</p>
              <div className="flex justify-center gap-6 text-sm">
                <a href="/privacy" className="text-slate-600 hover:text-blue-600 transition">Privacy Policy</a>
                <a href="/terms" className="text-slate-600 hover:text-blue-600 transition">Terms of Service</a>
                <a href="/methodology" className="text-slate-600 hover:text-blue-600 transition">Methodology</a>
              </div>
            </div>
          </footer>
        </LayoutErrorBoundary>
      </body>
    </html>
  );
}
