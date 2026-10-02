"use client";

import { useSyncExternalStore } from "react";
import type { GalleryPhoto } from "@/lib/gallery";

const picks = new Map<string, GalleryPhoto | null>();

const noopSubscribe = () => () => {};

// Picks one photo per page load in the browser (the static HTML renders none).
// Photos matching `prefer` are used when there are any.
export function useRandomPhoto(
  key: string,
  photos: GalleryPhoto[],
  prefer: (photo: GalleryPhoto) => boolean,
) {
  return useSyncExternalStore(
    noopSubscribe,
    () => {
      if (!picks.has(key)) {
        const preferred = photos.filter(prefer);
        const pool = preferred.length > 0 ? preferred : photos;
        picks.set(key, pool[Math.floor(Math.random() * pool.length)] ?? null);
      }
      return picks.get(key) ?? null;
    },
    () => null,
  );
}
