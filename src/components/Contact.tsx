const links = [
  {
    label: "YouTube",
    href: "https://www.youtube.com/@calebpark4373",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/caleb.park/",
  },
  {
    label: "Email",
    href: "mailto:caleb.yh.me@gmail.com",
  },
];

export default function Contact() {
  return (
    <section
      id="contact"
      className="border-t border-neutral-200 dark:border-neutral-800"
    >
      <div className="mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
        <p className="mb-6 text-xs tracking-[0.3em] text-neutral-400 uppercase">
          Contact
        </p>
        <h2 className="max-w-xl text-2xl leading-relaxed font-light text-neutral-800 sm:text-3xl dark:text-neutral-100">
          함께 이야기 나누고 싶다면 언제든 연락 주세요.
        </h2>
        <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="text-sm tracking-[0.1em] text-neutral-500 uppercase transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
