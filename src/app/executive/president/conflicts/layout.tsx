import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Presidential Conflicts of Interest",
  description:
    "Track Donald Trump's conflicts of interest — foreign payments, domestic business entanglements, and family involvement in government decisions.",
  openGraph: {
    title: "Presidential Conflicts of Interest | Accountability Dashboard",
    description:
      "Documented conflicts of interest for President Donald Trump: foreign payments, domestic conflicts, and family involvement.",
    type: "website",
  },
};

export default function PresidentConflictsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
