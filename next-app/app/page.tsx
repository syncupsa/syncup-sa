import React from "react";
import { Zone } from "next/headers";
import { createSampleUnifiedGraph, buildUnifiedGraph } from "../lib/jsonld";

// Server Component — stateless rendering, minimal JS
export default async function Page() {
  const graph = createSampleUnifiedGraph();
  const jsonLd = buildUnifiedGraph(graph);

  // Strict aspect-ratio box to guarantee CLS=0 for hero
  const heroStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 1200,
    margin: "0 auto",
    display: "block",
  };

  return (
    <main>
      <section style={{ padding: "48px 20px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              aspectRatio: "16/7",
              width: "100%",
              overflow: "hidden",
              borderRadius: 16,
              backgroundColor: "#EEF2FF",
            }}
          >
            <img
              src="/hero-brief.jpg"
              alt="Sync Up hero"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              fetchPriority="high"
            />
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px,4vw,48px)",
              marginTop: 20,
            }}
          >
            Sync Up — Local visibility & websites
          </h1>
          <p style={{ fontFamily: "var(--font-mono)", color: "var(--muted)", maxWidth: "58ch" }}>
            Fast local launches for Durban and South African businesses.
          </p>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
    </main>
  );
}
