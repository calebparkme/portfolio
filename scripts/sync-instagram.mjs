// Pulls photos from Instagram (Instagram API with Instagram Login) at build time.
// The first hashtag in each caption becomes the post's gallery category.
//
// Output (gitignored, regenerated on every sync):
//   public/gallery/instagram/<id>.jpg        (up to 2560px, hero + lightbox)
//   public/gallery/instagram/<id>-thumb.jpg  (800px, gallery grid)
//   public/gallery/instagram/posts.json
//
// Usage: IG_ACCESS_TOKEN=... [IG_TOKEN_OUT=path] node scripts/sync-instagram.mjs
// Without a token the script exits quietly and the gallery falls back to
// the bundled photos in src/data/gallery.ts.

import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const API = "https://graph.instagram.com";
const OUT_DIR = path.join(process.cwd(), "public", "gallery", "instagram");
const FIELDS =
  "id,caption,media_type,media_url,permalink,timestamp,children{media_type,media_url}";

const LARGE_WIDTH = 2560;
const THUMB_WIDTH = 800;

const token = process.env.IG_ACCESS_TOKEN;

if (!token) {
  console.log("[instagram] IG_ACCESS_TOKEN not set; skipping sync.");
  process.exit(0);
}

async function getJson(url) {
  const res = await fetch(url);
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.error) {
    const message = body.error?.message ?? `${res.status} ${res.statusText}`;
    throw new Error(`Instagram API request failed: ${message}`);
  }
  return body;
}

async function fetchAllMedia() {
  const media = [];
  let url = `${API}/me/media?fields=${encodeURIComponent(FIELDS)}&limit=100&access_token=${token}`;
  while (url) {
    const page = await getJson(url);
    media.push(...page.data);
    url = page.paging?.next ?? null;
  }
  return media;
}

// Long-lived tokens expire after 60 days and refreshing returns a new token.
// When IG_TOKEN_OUT is set, the new token is written there so CI can store it
// back into the IG_ACCESS_TOKEN secret.
async function refreshToken() {
  try {
    const body = await getJson(
      `${API}/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`,
    );
    const days = Math.round(body.expires_in / 86400);
    console.log(`[instagram] Token refreshed; expires in ~${days} days.`);
    if (process.env.IG_TOKEN_OUT && body.access_token) {
      await writeFile(process.env.IG_TOKEN_OUT, body.access_token, { mode: 0o600 });
    }
  } catch (error) {
    console.warn(`[instagram] Token refresh skipped: ${error.message}`);
  }
}

function firstHashtag(caption) {
  const match = caption?.match(/#([\p{L}\p{N}_]+)/u);
  return match ? match[1] : null;
}

// The caption as written, minus hashtags, for the lightbox overlay.
function cleanCaption(caption) {
  return (caption ?? "")
    .replace(/#[\p{L}\p{N}_]+/gu, "")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function captionToAlt(caption, category) {
  const text = (caption ?? "")
    .replace(/#[\p{L}\p{N}_]+/gu, "")
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);
  if (!text) return category ? `Instagram photo — ${category}` : "Instagram photo";
  return text.length > 140 ? `${text.slice(0, 137)}…` : text;
}

function coverImageUrl(item) {
  if (item.media_type === "IMAGE") return item.media_url;
  if (item.media_type === "CAROUSEL_ALBUM") {
    return item.children?.data.find((child) => child.media_type === "IMAGE")?.media_url;
  }
  return undefined; // videos/reels are not part of the photo gallery
}

// Instagram serves originals up to ~4096px; resize once here so the site
// never ships them as-is.
async function saveResized(buffer, width, filePath) {
  return sharp(buffer)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(filePath);
}

async function main() {
  await refreshToken();
  const media = await fetchAllMedia();
  await mkdir(OUT_DIR, { recursive: true });

  const posts = [];
  for (const item of media) {
    const imageUrl = coverImageUrl(item);
    if (!imageUrl) continue;

    const res = await fetch(imageUrl);
    if (!res.ok) {
      console.warn(`[instagram] Could not download ${item.id}: ${res.status}`);
      continue;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const fileName = `${item.id}.jpg`;
    const thumbName = `${item.id}-thumb.jpg`;
    const size = await saveResized(buffer, LARGE_WIDTH, path.join(OUT_DIR, fileName));
    await saveResized(buffer, THUMB_WIDTH, path.join(OUT_DIR, thumbName));

    const category = firstHashtag(item.caption);
    posts.push({
      id: item.id,
      src: `/gallery/instagram/${fileName}`,
      thumb: `/gallery/instagram/${thumbName}`,
      width: size.width,
      height: size.height,
      alt: captionToAlt(item.caption, category),
      caption: cleanCaption(item.caption) || undefined,
      category,
      permalink: item.permalink,
      timestamp: item.timestamp,
    });
  }

  // Drop images for posts that were deleted on Instagram.
  const keep = new Set(posts.flatMap((post) => [`${post.id}.jpg`, `${post.id}-thumb.jpg`]));
  for (const file of await readdir(OUT_DIR)) {
    if (file.endsWith(".jpg") && !keep.has(file)) {
      await rm(path.join(OUT_DIR, file));
    }
  }

  await writeFile(path.join(OUT_DIR, "posts.json"), `${JSON.stringify(posts, null, 2)}\n`);
  const categories = new Set(posts.map((post) => post.category?.toLowerCase()).filter(Boolean));
  console.log(`[instagram] Synced ${posts.length} photos in ${categories.size} categories.`);
}

main().catch((error) => {
  console.error(`[instagram] ${error.message}`);
  process.exit(1);
});
