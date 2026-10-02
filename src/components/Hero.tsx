"use client";

import { useState } from "react";
import { withBasePath } from "@/lib/basePath";
import type { GalleryPhoto } from "@/lib/gallery";
import { useRandomPhoto } from "@/lib/useRandomPhoto";
import type { Dictionary } from "@/dictionaries/types";

const isLandscape = (photo: GalleryPhoto) => photo.width > photo.height;

export default function Hero({
  dict,
  photos,
}: {
  dict: Dictionary["hero"];
  photos: GalleryPhoto[];
}) {
  const photo = useRandomPhoto("hero", photos, isLandscape);
  const [loaded, setLoaded] = useState(false);

  return (
    <section id="top" className="relative flex h-screen w-full items-end overflow-hidden bg-neutral-900">
      {photo && (
        <img
          src={withBasePath(photo.src)}
          alt=""
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/5 to-transparent" />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 sm:px-10 sm:pb-28">
        <p className="mb-4 text-xs tracking-[0.3em] text-white/90 uppercase [text-shadow:0_1px_8px_rgba(0,0,0,0.4)]">
          {dict.kicker}
        </p>
        <h1 className="max-w-3xl text-4xl leading-tight font-light text-white [text-shadow:0_2px_16px_rgba(0,0,0,0.4)] sm:text-6xl">
          {dict.name}
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-white/95 [text-shadow:0_1px_8px_rgba(0,0,0,0.4)] sm:text-lg">
          {dict.description.map((line, index) => (
            <span key={line}>
              {line}
              {index < dict.description.length - 1 && <br />}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
