"use client";

import { useCallback, useEffect, useState } from "react";
import { galleryImages } from "@/data/gallery";
import { withBasePath } from "@/lib/basePath";

export default function Gallery() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);

  const showNext = useCallback(() => {
    setActiveIndex((current) =>
      current === null ? null : (current + 1) % galleryImages.length,
    );
  }, []);

  const showPrev = useCallback(() => {
    setActiveIndex((current) =>
      current === null
        ? null
        : (current - 1 + galleryImages.length) % galleryImages.length,
    );
  }, []);

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

  const active = activeIndex === null ? null : galleryImages[activeIndex];

  return (
    <section id="gallery" className="mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
      <p className="mb-10 text-xs tracking-[0.3em] text-neutral-400 uppercase">
        Gallery
      </p>
      <div className="columns-2 gap-3 sm:columns-3 sm:gap-4">
        {galleryImages.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="mb-3 block w-full break-inside-avoid overflow-hidden rounded-sm sm:mb-4"
          >
            <img
              src={withBasePath(image.src)}
              alt=""
              width={image.width}
              height={image.height}
              loading="lazy"
              className="w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 sm:p-10"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
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
            aria-label="Previous"
            className="absolute left-2 text-3xl text-white/60 hover:text-white sm:left-6"
          >
            ‹
          </button>
          <img
            src={withBasePath(active.src)}
            alt=""
            onClick={(event) => event.stopPropagation()}
            className="max-h-full max-w-full object-contain"
          />
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              showNext();
            }}
            aria-label="Next"
            className="absolute right-2 text-3xl text-white/60 hover:text-white sm:right-6"
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
}
