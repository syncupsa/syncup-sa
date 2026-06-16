import React from "react";
import type { Metadata } from "next";
import { buildUnifiedGraph, createSampleUnifiedGraph } from "../lib/jsonld";

export const metadata: Metadata = {
  title: "Sync Up — Local Visibility",
  description: "Local visibility and websites for South African businesses",
  alternates: { canonical: "https://syncup.example.com" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const unified = createSampleUnifiedGraph();
  const jsonLd = buildUnifiedGraph(unified);

  return (
    <html lang="en">
      <head>
        {/* LCP preload for hero image and high priority resources */}
        <link rel="preload" href="/hero-brief.jpg" as="image" fetchpriority="high" />
        <link rel="preload" href="/styles.css" as="style" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
