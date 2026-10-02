"use client";

import { useState } from "react";
import { withBasePath } from "@/lib/basePath";
import type { GalleryPhoto } from "@/lib/gallery";
import { useRandomPhoto } from "@/lib/useRandomPhoto";
import type { Dictionary } from "@/dictionaries/types";

// The frame is 4:5, so portrait photos crop best. The hero only uses
// landscape photos, so the two sections never show the same one.
const isPortrait = (photo: GalleryPhoto) => photo.height > photo.width;

export default function About({
  dict,
  photos,
}: {
  dict: Dictionary["about"];
  photos: GalleryPhoto[];
}) {
  const photo = useRandomPhoto("about", photos, isPortrait);
  const [loaded, setLoaded] = useState(false);

  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
      <div className="grid grid-cols-1 gap-12 sm:grid-cols-5 sm:gap-16">
        <div className="sm:col-span-2">
          <div className="aspect-4/5 w-full overflow-hidden rounded-sm bg-neutral-100">
            {photo && (
              <img
                src={withBasePath(photo.src)}
                srcSet={
                  photo.thumb
                    ? `${withBasePath(photo.thumb)} 800w, ${withBasePath(photo.src)} ${photo.width}w`
                    : undefined
                }
                sizes="(min-width: 640px) 40vw, 100vw"
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                onLoad={() => setLoaded(true)}
                className={`h-full w-full object-cover transition-opacity duration-1000 ${
                  loaded ? "opacity-100" : "opacity-0"
                }`}
              />
            )}
          </div>
        </div>
        <div className="flex flex-col justify-center sm:col-span-3">
          <p className="mb-4 text-xs tracking-[0.3em] text-neutral-400 uppercase">
            {dict.kicker}
          </p>
          <p className="text-xl leading-relaxed font-light text-neutral-800 sm:text-2xl">
            {dict.heading.map((line, index) => (
              <span key={line}>
                {line}
                {index < dict.heading.length - 1 && <br />}
              </span>
            ))}
          </p>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-neutral-500">
            {dict.body.map((line, index) => (
              <span key={line}>
                {line}
                {index < dict.body.length - 1 && <br />}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
