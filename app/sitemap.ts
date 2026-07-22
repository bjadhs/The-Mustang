import type { MetadataRoute } from "next";

// Public, indexable routes only. /prompt is intentionally excluded (it carries
// robots noindex). Absolute URLs are resolved against the same host used by the
// root metadataBase.
const BASE = "https://themustangcanberra.com.au";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/menu", priority: 0.9 },
    { path: "/reserve", priority: 0.9 },
    { path: "/about", priority: 0.7 },
    { path: "/catering", priority: 0.7 },
  ];
  return routes.map(({ path, priority }) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority,
  }));
}
