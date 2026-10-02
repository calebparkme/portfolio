"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { withBasePath } from "@/lib/basePath";
import type { GalleryData, GalleryPhoto } from "@/lib/gallery";
import type { Dictionary } from "@/dictionaries/types";

const ALL = "__all__";
const PAGE_SIZE = 12;

const wideQuery = "(min-width: 640px)";

function subscribeToWidth(onChange: () => void) {
  const media = window.matchMedia(wideQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function useColumnCount() {
  return useSyncExternalStore(
    subscribeToWidth,
    () => (window.matchMedia(wideQuery).matches ? 3 : 2),
    () => 3,
  );
}

// Places each photo in the currently shortest column. Unlike CSS columns,
// photos already on screen keep their position when more are appended.
function toColumns(photos: GalleryPhoto[], count: number) {
  const columns = Array.from({ length: count }, () => ({
    height: 0,
    items: [] as { photo: GalleryPhoto; index: number }[],
  }));
  photos.forEach((photo, index) => {
    const shortest = columns.reduce((min, column) =>
      column.height < min.height ? column : min,
    );
    shortest.items.push({ photo, index });
    shortest.height += photo.height / photo.width;
  });
  return columns.map((column) => column.items);
}

export default function Gallery({
  dict,
  data,
}: {
  dict: Dictionary["gallery"];
  data: GalleryData;
}) {
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const columnCount = useColumnCount();

  const photos =
    data.categories.find((category) => category.key === activeCategory)?.photos ??
    data.photos;
  const visiblePhotos = photos.slice(0, visibleCount);

  const close = useCallback(() => setActiveIndex(null), []);

  const showNext = useCallback(() => {
    setActiveIndex((current) =>
      current === null ? null : (current + 1) % photos.length,
    );
  }, [photos.length]);

  const showPrev = useCallback(() => {
    setActiveIndex((current) =>
      current === null ? null : (current - 1 + photos.length) % photos.length,
    );
  }, [photos.length]);

  useEffect(() => {
    if (activeIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") showNext();
      if (event.key === "ArrowLeft") showPrev();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeIndex, close, showNext, showPrev]);

  const active = activeIndex === null ? null : photos[activeIndex];

  const tabs = [
    { key: ALL, label: dict.allLabel, count: data.photos.length },
    ...data.categories.map((category) => ({
      key: category.key,
      label: `#${category.label}`,
      count: category.photos.length,
    })),
  ];

  return (
    <section id="gallery" className="mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
      <p className="mb-10 text-xs tracking-[0.3em] text-neutral-400 uppercase">
        {dict.kicker}
      </p>
      {data.categories.length > 0 && (
        <div className="mx-auto mb-8 flex w-4/5 flex-wrap gap-x-5 gap-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setActiveCategory(tab.key);
                setVisibleCount(PAGE_SIZE);
              }}
              aria-pressed={activeCategory === tab.key}
              className={`text-sm tracking-wide transition-colors ${
                activeCategory === tab.key
                  ? "text-neutral-900"
                  : "text-neutral-400 hover:text-neutral-700"
              }`}
            >
              {tab.label}
              <span className="ml-1 text-xs text-neutral-400">{tab.count}</span>
            </button>
          ))}
        </div>
      )}
      <div className="mx-auto flex w-4/5 items-start gap-3 sm:gap-4">
        {toColumns(visiblePhotos, columnCount).map((column, columnIndex) => (
          <div key={columnIndex} className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-4">
            {column.map(({ photo, index }) => (
              <button
                key={photo.src}
                type="button"
                onClick={() => setActiveIndex(index)}
                className="block w-full overflow-hidden rounded-sm"
              >
                <img
                  src={withBasePath(photo.src)}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  loading="lazy"
                  className="w-full grayscale object-cover transition-all duration-500 hover:scale-105 hover:grayscale-0"
                />
              </button>
            ))}
          </div>
        ))}
      </div>
      {visibleCount < photos.length && (
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            className="border border-neutral-300 px-8 py-3 text-xs tracking-[0.2em] text-neutral-600 uppercase transition-colors hover:border-neutral-900 hover:text-neutral-900"
          >
            {dict.moreLabel}
            <span className="ml-2 text-neutral-400">
              {visibleCount} / {photos.length}
            </span>
          </button>
        </div>
      )}

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 sm:p-10"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label={dict.closeLabel}
            className="absolute top-6 right-6 text-3xl leading-none text-white/70 hover:text-white"
          >
            ×
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showPrev();
            }}
            aria-label={dict.prevLabel}
            className="absolute left-2 text-3xl text-white/60 hover:text-white sm:left-6"
          >
            ‹
          </button>
          <img
            src={withBasePath(active.src)}
            alt={active.alt}
            onClick={(event) => event.stopPropagation()}
            className="max-h-full max-w-full object-contain"
          />
          {active.permalink && (
            <a
              href={active.permalink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="absolute bottom-6 text-xs tracking-[0.2em] text-white/60 uppercase hover:text-white"
            >
              {dict.viewOnInstagram}
            </a>
          )}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showNext();
            }}
            aria-label={dict.nextLabel}
            className="absolute right-2 text-3xl text-white/60 hover:text-white sm:right-6"
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
}
