import { z } from "zod";

export const GeoCoordinatesSchema = z.object({
  "@type": z.literal("GeoCoordinates"),
  latitude: z.number(),
  longitude: z.number(),
});

export const DepartmentSchema = z.object({
  "@type": z.literal("Organization"),
  name: z.string().min(1),
  telephone: z.string().min(6),
  email: z.string().email().optional(),
  address: z.string().min(1).optional(),
});

export const LocalBusinessSchema = z.object({
  "@type": z.literal("LocalBusiness"),
  "@id": z.string().url(),
  name: z.string().min(1),
  telephone: z.string().min(6),
  address: z.object({
    streetAddress: z.string(),
    addressLocality: z.string(),
    postalCode: z.string(),
    addressRegion: z.string(),
    addressCountry: z.string().length(2),
  }),
  geo: GeoCoordinatesSchema,
  department: z.array(DepartmentSchema).optional(),
});

export const OrganizationSchema = z.object({
  "@type": z.literal("Organization"),
  "@id": z.string().url(),
  name: z.string().min(1),
  url: z.string().url(),
  logo: z.string().url().optional(),
});

export const WebSiteSchema = z.object({
  "@type": z.literal("WebSite"),
  "@id": z.string().url(),
  url: z.string().url(),
  name: z.string().min(1),
});

export const UnifiedGraphSchema = z.object({
  "@context": z.literal("https://schema.org"),
  "@graph": z.array(z.union([OrganizationSchema, LocalBusinessSchema, WebSiteSchema])),
});

export type UnifiedGraph = z.infer<typeof UnifiedGraphSchema>;
