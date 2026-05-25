export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.christianity-at-the-crossroads.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}