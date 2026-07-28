import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Terms of Use — MinderCart",
  description:
    "Read the terms that apply when using the MinderCart website, web application, and private beta.",
  openGraph: {
    title: "Terms of Use — MinderCart",
    description:
      "Read the terms that apply when using the MinderCart website, web application, and private beta.",
    type: "website",
  },
};

export default function TermsLayout({
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
