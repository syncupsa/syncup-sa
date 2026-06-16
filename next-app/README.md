This `next-app/` folder contains a Next.js 15 (App Router) reference module optimized for Edge-based international routing, Core Web Vitals, and a hyper-optimized JSON-LD unified graph.

Files added:

- middleware.ts — Edge middleware for hreflang and geo-routing (Cloudflare/Vercel compatible)
- app/layout.tsx — Root layout with LCP preloads and JSON-LD injection
- app/page.tsx — Server Component with CLS-safe hero and JSON-LD
- components/LocaleSwitcher.client.tsx — Client component using `startTransition`
- lib/schemas.ts — Zod schemas for strict validation
- lib/jsonld.ts — Unified JSON-LD graph builder and sample graph

Usage notes:

- Drop this into a Next.js 15 project and install dependencies:

```bash
npm install zod
```

- The `middleware.ts` is written to run in Edge runtime; on Cloudflare Workers you'd map to the Worker script similarly.

Verification: run your Next dev server and inspect the HTML head for `application/ld+json`, `link rel=preload`, and `Link` headers emitted by middleware.
