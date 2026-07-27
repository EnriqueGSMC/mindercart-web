import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "MinderCart — Never forget what to buy",
  description:
    "Create reusable grocery lists, organize items by category, and spend less time shopping.",
  openGraph: {
    title: "MinderCart — Never forget what to buy",
    description:
      "Create reusable grocery lists, organize items by category, and spend less time shopping.",
    type: "website",
  },
};

export default function BetaLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        .mc-bottom-nav {
          display: none !important;
        }

        .mc-app-frame {
          padding-bottom: 0 !important;
        }
      `}</style>
      {children}
    </>
  );
}
