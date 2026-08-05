import { socialLinks } from "@/lib/site";
import type { Dictionary } from "@/dictionaries/types";

export default function Contact({ dict }: { dict: Dictionary["contact"] }) {
  const links = [
    { label: dict.links.youtube, href: socialLinks.youtube },
    { label: dict.links.instagram, href: socialLinks.instagram },
    { label: dict.links.email, href: `mailto:${socialLinks.email}` },
  ];

  return (
    <section id="contact" className="border-t border-neutral-200">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
        <p className="mb-6 text-xs tracking-[0.3em] text-neutral-400 uppercase">
          {dict.kicker}
        </p>
        <h2 className="max-w-xl text-2xl leading-relaxed font-light text-neutral-800 sm:text-3xl">
          {dict.heading}
        </h2>
        <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="text-sm tracking-[0.1em] text-neutral-500 uppercase transition-colors hover:text-neutral-900"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
