export default async (request, context) => {
  const serverEntry = await import("../../dist/server/index.js");
  const handler = serverEntry.default ?? serverEntry;

  return handler.fetch(request, {}, context);
};

export const config = {
  path: "/*",
  preferStatic: true,
};
