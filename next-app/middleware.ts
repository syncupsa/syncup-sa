import { NextRequest, NextResponse } from "next/server";

// Strict 4-tier market matrix helper types
type MarketTier = "local" | "regional" | "national" | "international";

interface LocaleRoute {
  href: string;
  hreflang: string;
  tier: MarketTier;
}

const MARKET_MATRIX = (
  origin: string,
  pathname: string,
  zip: string | null,
  region: string | null,
  country: string,
): LocaleRoute[] => {
  const list: LocaleRoute[] = [];
  // Local (zip)
  if (zip)
    list.push({
      href: `${origin}${pathname}?loc=${zip}`,
      hreflang: `${country}-${zip}`,
      tier: "local",
    });
  // Regional (state)
  if (region)
    list.push({
      href: `${origin}${pathname}?region=${encodeURIComponent(region)}`,
      hreflang: `${country}-${region}`,
      tier: "regional",
    });
  // National (ISO-3166-1 alpha-2)
  list.push({ href: `${origin}${pathname}`, hreflang: country.toLowerCase(), tier: "national" });
  // International (language-region fallback)
  list.push({ href: `${origin}${pathname}`, hreflang: "en", tier: "international" });
  return list;
};

function pickBestAlternate(
  alternates: LocaleRoute[],
  acceptLanguage: string | null,
  cfCountry: string | null,
) {
  if (acceptLanguage) {
    try {
      const lang = acceptLanguage.split(",")[0].split(";")[0];
      const found = alternates.find((a) => a.hreflang.toLowerCase().startsWith(lang.toLowerCase()));
      if (found) return found;
    } catch {
      /* ignore */
    }
  }
  if (cfCountry) {
    const found = alternates.find((a) =>
      a.hreflang.toLowerCase().startsWith(cfCountry.toLowerCase()),
    );
    if (found) return found;
  }
  return alternates[0];
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const origin = `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ""}`;
  const pathname = url.pathname;
  const acceptLang = req.headers.get("accept-language");
  const cfCountry =
    req.headers.get("cf-ipcountry") || req.headers.get("x-vercel-ip-country") || null;

  // Extract optional query markers (zip/region) for direct mapping
  const zip = url.searchParams.get("loc");
  const region = url.searchParams.get("region");
  const country = (cfCountry || "ZA").toUpperCase();

  const alternates = MARKET_MATRIX(origin, pathname, zip, region, country);

  // Avoid redirect loops: if we already served an alternate, skip redirect
  const served = req.cookies.get("x-served-hreflang");
  if (served) {
    return NextResponse.next();
  }

  const best = pickBestAlternate(alternates, acceptLang, cfCountry);

  // If the request already matches best.href, no redirect
  if (url.href === best.href) {
    return NextResponse.next();
  }

  // Issue a 302 to selected alternate and set a short cookie to avoid loops
  const res = NextResponse.redirect(best.href, 302);
  res.cookies.set({
    name: "x-served-hreflang",
    value: best.hreflang,
    maxAge: 60 * 5,
    httpOnly: true,
    path: "/",
  });

  // Inject Link headers for all alternates (Edge-friendly)
  const linkHeader = alternates
    .map((a) => `<${a.href}>; rel="alternate"; hreflang="${a.hreflang}"`)
    .join(", ");
  res.headers.set("Link", linkHeader);

  return res;
}

export const config = {
  matcher: "/:path*",
};
