import type { Metadata } from "next";
import DevelopmentBanner from "@/components/DevelopmentBanner";
import HamburgerMenu from "@/components/HamburgerMenu";
import "./globals.css";

export const metadata: Metadata = {
  title: "Accountability Dashboard",
  description: "Tracking power. Protecting democracy. Monitor all three branches of government with transparent data.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <DevelopmentBanner />
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <a href="/" className="text-lg sm:text-xl font-bold text-slate-900 hover:text-blue-600 transition truncate">
                🏛️ <span className="hidden xs:inline">Accountability Dashboard</span><span className="inline xs:hidden">Dashboard</span>
              </a>
              <HamburgerMenu />
            </div>
          </div>
        </nav>
        <main className="bg-slate-50">{children}</main>
        <footer className="bg-white border-t border-slate-200 py-12 mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 leading-relaxed space-y-3">
            <p className="font-semibold text-slate-700 text-sm sm:text-base">Built by Aria Labs</p>
            <p className="text-sm sm:text-base">Data from Congress.gov, Voteview, and OpenFEC</p>
            <p className="text-sm sm:text-base">Democracy shouldn't be paywalled. This is open source.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
