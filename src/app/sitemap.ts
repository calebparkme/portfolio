import type { MetadataRoute } from "next";
import { galleryImages } from "@/data/gallery";
import { localePaths } from "@/i18n/config";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const images = galleryImages.map((image) => `${siteUrl}${image.src}`);
  const languages = {
    en: `${siteUrl}${localePaths.en}`,
    ko: `${siteUrl}${localePaths.ko}`,
  };

  return [
    {
      url: `${siteUrl}${localePaths.en}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages },
      images,
    },
    {
      url: `${siteUrl}${localePaths.ko}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages },
      images,
    },
  ];
}
