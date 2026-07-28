import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Privacy Policy — MinderCart",
  description:
    "Learn how MinderCart collects, uses, stores, and protects information.",
  openGraph: {
    title: "Privacy Policy — MinderCart",
    description:
      "Learn how MinderCart collects, uses, stores, and protects information.",
    type: "website",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
