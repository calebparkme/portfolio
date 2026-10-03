import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { galleryImages } from "@/data/gallery";
import type { Locale } from "@/i18n/config";

export type GalleryPhoto = {
  src: string;
  thumb?: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  permalink?: string;
};

export type GalleryCategory = {
  key: string;
  label: string;
  photos: GalleryPhoto[];
};

export type GalleryData = {
  photos: GalleryPhoto[];
  categories: GalleryCategory[];
};

type InstagramPost = GalleryPhoto & {
  id: string;
  altEn?: string;
  captionEn?: string;
  category: string | null;
  timestamp: string;
};

// Written by scripts/sync-instagram.mjs before the build.
const POSTS_FILE = path.join(process.cwd(), "public", "gallery", "instagram", "posts.json");

function readInstagramPosts(): InstagramPost[] {
  if (!existsSync(POSTS_FILE)) return [];
  return JSON.parse(readFileSync(POSTS_FILE, "utf8")) as InstagramPost[];
}

// Captions are written in Korean; the English page uses the translation
// from the sync step when there is one.
function localizePost(post: InstagramPost, locale: Locale): InstagramPost {
  if (locale !== "en") return post;
  return {
    ...post,
    alt: post.altEn ?? post.alt,
    caption: post.captionEn ?? post.caption,
  };
}

// Runs at build time (static export). Groups Instagram photos by the first
// hashtag of each caption; categories with the most photos come first.
export function getGalleryData(locale: Locale): GalleryData {
  const posts = readInstagramPosts()
    .map((post) => localizePost(post, locale))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  if (posts.length === 0) {
    return {
      photos: galleryImages.map((image) => ({ ...image, alt: image.alt[locale] })),
      categories: [],
    };
  }

  const groups = new Map<string, GalleryCategory>();
  for (const post of posts) {
    if (!post.category) continue;
    const key = post.category.toLowerCase();
    const group = groups.get(key) ?? { key, label: post.category, photos: [] };
    group.photos.push(post);
    groups.set(key, group);
  }

  return {
    photos: posts,
    categories: [...groups.values()].sort((a, b) => b.photos.length - a.photos.length),
  };
}
