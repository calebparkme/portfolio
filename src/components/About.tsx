import { galleryImages } from "@/data/gallery";
import { withBasePath } from "@/lib/basePath";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/dictionaries/types";

// caleb-2026-07-19-01.jpg (originally IMG_1204.jpeg)
const featured = galleryImages.find((image) => image.src.endsWith("photo-12.jpg"))!;

export default function About({
  dict,
  locale,
}: {
  dict: Dictionary["about"];
  locale: Locale;
}) {
  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
      <div className="grid grid-cols-1 gap-12 sm:grid-cols-5 sm:gap-16">
        <div className="sm:col-span-2">
          <img
            src={withBasePath(featured.src)}
            alt={featured.alt[locale]}
            width={featured.width}
            height={featured.height}
            className="aspect-4/5 w-full rounded-sm object-cover"
            loading="lazy"
          />
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
