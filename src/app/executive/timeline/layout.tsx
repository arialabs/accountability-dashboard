import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Executive Actions Timeline",
  description:
    "Track executive orders, memorandums, budget cuts, firings, and all executive actions with dates and impact analysis.",
  openGraph: {
    title: "Executive Actions Timeline | Accountability Dashboard",
    description:
      "A chronological record of executive orders, budget cuts, appointments, and other executive branch actions.",
    type: "website",
  },
};

export default function TimelineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
