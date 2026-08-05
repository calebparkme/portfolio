import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/dictionaries/types";

export default function Header({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const links = [
    { href: "#about", label: dict.nav.about },
    { href: "#gallery", label: dict.nav.gallery },
    { href: "#contact", label: dict.nav.contact },
  ];
  const otherLocaleHref = locale === "en" ? "/ko/" : "/";

  return (
    <header className="fixed inset-x-0 top-0 z-50 mix-blend-difference">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-white sm:px-10">
        <a href="#top" className="text-sm font-medium tracking-[0.2em] uppercase">
          Caleb Park
        </a>
        <nav className="flex items-center gap-6 text-xs tracking-[0.15em] uppercase sm:gap-8">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="opacity-80 transition-opacity hover:opacity-100"
            >
              {link.label}
            </a>
          ))}
          <a
            href={otherLocaleHref}
            hrefLang={locale === "en" ? "ko" : "en"}
            className="opacity-80 transition-opacity hover:opacity-100"
          >
            {dict.languageSwitch.label}
          </a>
        </nav>
      </div>
    </header>
  );
}
