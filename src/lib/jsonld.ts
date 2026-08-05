import { getDictionary } from "@/dictionaries";
import type { Locale } from "@/i18n/config";
import { ogImage, siteUrl, socialLinks } from "@/lib/site";

export function buildPersonJsonLd(locale: Locale) {
  const dict = getDictionary(locale);

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Caleb Park",
    url: siteUrl,
    image: `${siteUrl}${ogImage.url}`,
    jobTitle: ["Photographer", "Videographer"],
    description: dict.meta.description,
    sameAs: [socialLinks.youtube, socialLinks.instagram],
  };
}
