// Pulls photos from Instagram (Instagram API with Instagram Login) at build time.
// The first hashtag in each caption becomes the post's gallery category.
//
// Output (gitignored, regenerated on every sync):
//   public/gallery/instagram/<id>.jpg        (up to 2560px, hero + lightbox)
//   public/gallery/instagram/<id>-thumb.jpg  (800px, gallery grid)
//   public/gallery/instagram/posts.json
//
// Usage: IG_ACCESS_TOKEN=... [IG_TOKEN_OUT=path] [ANTHROPIC_API_KEY=...] node scripts/sync-instagram.mjs
// Without a token the script exits quietly and the gallery falls back to
// the bundled photos in src/data/gallery.ts.
//
// Korean captions get an English version (captionEn/altEn) for the English
// page: translated with Claude when ANTHROPIC_API_KEY is set, falling back to
// Google Translate's public endpoint. If both fail the English page shows the
// original caption.

import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
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

const HANGUL = /[\u3131-\u318E\uAC00-\uD7A3]/;

// Set to null after an authentication error so the remaining captions go
// straight to Google Translate instead of failing one by one.
let anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;
const translatedBy = new Set();

async function translateWithClaude(text) {
  const response = await anthropic.beta.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 4000,
    output_config: { effort: "low" },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system:
      "You translate Instagram photo captions written in Korean into natural English. " +
      "Keep the tone, line breaks, emoji and proper nouns. " +
      "Reply with the translation only.",
    messages: [{ role: "user", content: text }],
  });
  if (response.stop_reason === "refusal") throw new Error("translation declined");
  const translated = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();
  if (!translated) throw new Error("empty translation");
  return translated;
}

async function translateWithGoogle(text) {
  const url =
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl=en&dt=t&q=" +
    encodeURIComponent(text);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const body = await res.json();
  return body[0].map((segment) => segment[0]).join("").trim();
}

// English version of a caption, or undefined when it has no Korean or the
// translation failed (the English page then falls back to the original).
async function translateCaption(id, text) {
  if (!text || !HANGUL.test(text)) return undefined;
  if (anthropic) {
    try {
      const translated = await translateWithClaude(text);
      translatedBy.add("Claude");
      return translated;
    } catch (error) {
      console.warn(`[instagram] Claude could not translate ${id}: ${error.message}`);
      if (error instanceof Anthropic.AuthenticationError) {
        console.warn("[instagram] Check the ANTHROPIC_API_KEY secret; using Google Translate.");
        anthropic = null;
      }
    }
  }
  try {
    const translated = await translateWithGoogle(text);
    translatedBy.add("Google Translate");
    return translated;
  } catch (error) {
    console.warn(`[instagram] Could not translate caption of ${id}: ${error.message}`);
    return undefined;
  }
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
    const caption = cleanCaption(item.caption) || undefined;
    const captionEn = await translateCaption(item.id, caption);
    posts.push({
      id: item.id,
      src: `/gallery/instagram/${fileName}`,
      thumb: `/gallery/instagram/${thumbName}`,
      width: size.width,
      height: size.height,
      alt: captionToAlt(item.caption, category),
      altEn: captionEn ? captionToAlt(captionEn, category) : undefined,
      caption,
      captionEn,
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

  if (translatedBy.size > 0) {
    const engines = [...translatedBy].join(" and ");
    console.log(`[instagram] Translated captions to English with ${engines}.`);
  }
  await writeFile(path.join(OUT_DIR, "posts.json"), `${JSON.stringify(posts, null, 2)}\n`);
  const categories = new Set(posts.map((post) => post.category?.toLowerCase()).filter(Boolean));
  console.log(`[instagram] Synced ${posts.length} photos in ${categories.size} categories.`);
}

main().catch((error) => {
  console.error(`[instagram] ${error.message}`);
  process.exit(1);
});
