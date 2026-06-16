import { UnifiedGraphSchema, UnifiedGraph } from "./schemas";

export function buildUnifiedGraph(data: UnifiedGraph): string {
  const parsed = UnifiedGraphSchema.parse(data);

  // Create a single top-level node that references other entities via @id
  const nodeId = `${parsed["@graph"][0]["@id"]}#unified`;

  // Consolidate into a single-node graph with explicit @id references (no orphan nodes)
  const singleNode = {
    "@context": parsed["@context"],
    "@id": nodeId,
    "@type": "WebPage",
    mainEntity: parsed["@graph"].map((entity) => ({ "@id": entity["@id"] })),
    publisher: { "@id": parsed["@graph"][0]["@id"] },
  } as const;

  const output = { "@context": parsed["@context"], "@graph": [singleNode, ...parsed["@graph"]] };

  // Validate final shape with the same schema-ish assumptions (manual check)
  if (!Array.isArray(output["@graph"]) || output["@graph"].length < 2) {
    throw new Error("Invalid unified graph construction");
  }

  return JSON.stringify(output, null, 2);
}

// Helper factory with strict typing
export function createSampleUnifiedGraph(): UnifiedGraph {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://syncup.example.com#org",
        name: "Sync Up",
        url: "https://syncup.example.com",
        logo: "https://syncup.example.com/logo.svg",
      },
      {
        "@type": "LocalBusiness",
        "@id": "https://syncup.example.com#durban",
        name: "Sync Up Durban",
        telephone: "+27-31-000-0000",
        address: {
          streetAddress: "1 Market St",
          addressLocality: "Durban",
          postalCode: "4001",
          addressRegion: "KwaZulu-Natal",
          addressCountry: "ZA",
        },
        geo: { "@type": "GeoCoordinates", latitude: -29.8587, longitude: 31.0218 },
        department: [
          {
            "@type": "Organization",
            name: "Customer Success",
            telephone: "+27-31-000-0001",
            email: "cs@syncup.example.com",
            address: "1 Market St",
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://syncup.example.com#site",
        url: "https://syncup.example.com",
        name: "Sync Up — Local Visibility",
      },
    ],
  };
}
