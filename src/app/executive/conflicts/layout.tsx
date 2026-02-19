import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cabinet Conflicts of Interest",
  description:
    "Track conflicts of interest across all cabinet members and executive officials — financial holdings, corporate ties, and potential policy conflicts.",
  openGraph: {
    title: "Cabinet Conflicts of Interest | Accountability Dashboard",
    description:
      "Analyze conflicts of interest across cabinet members including financial holdings, corporate board seats, and prior lobbying.",
    type: "website",
  },
};

export default function ConflictsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
