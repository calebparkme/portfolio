import type { Metadata } from "next";
import { getDictionary } from "@/dictionaries";
import { localePaths, type Locale } from "@/i18n/config";
import { ogImage, siteName, siteUrl } from "@/lib/site";

const ogLocale: Record<Locale, string> = {
  en: "en_US",
  ko: "ko_KR",
};

const otherLocale: Record<Locale, Locale> = {
  en: "ko",
  ko: "en",
};

export function buildMetadata(locale: Locale): Metadata {
  const dict = getDictionary(locale);
  const path = localePaths[locale];
  const image = { ...ogImage, alt: dict.meta.title };

  return {
    metadataBase: new URL(siteUrl),
    title: dict.meta.title,
    description: dict.meta.description,
    keywords: dict.meta.keywords,
    alternates: {
      canonical: path,
      languages: {
        en: localePaths.en,
        ko: localePaths.ko,
        "x-default": localePaths.en,
      },
    },
    openGraph: {
      type: "website",
      url: path,
      siteName,
      title: dict.meta.title,
      description: dict.meta.description,
      locale: ogLocale[locale],
      alternateLocale: ogLocale[otherLocale[locale]],
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
      images: [image.url],
    },
    robots: {
      index: true,
      follow: true,
    },
    verification: {
      google: "uO7ul6nQaG2vcYJf7VrihKoTNWf3zOAwh5r9y3GNnAo",
      other: {
        "naver-site-verification": "b5eb1dba3cf476350140b43a145e994cc5f81c12",
      },
    },
  };
}
