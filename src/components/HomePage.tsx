import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Gallery from "@/components/Gallery";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { getDictionary } from "@/dictionaries";
import type { Locale } from "@/i18n/config";

export default function HomePage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <>
      <Header dict={dict} locale={locale} />
      <main className="flex-1">
        <Hero dict={dict.hero} />
        <About dict={dict.about} locale={locale} />
        <Gallery dict={dict.gallery} locale={locale} />
        <Contact dict={dict.contact} />
      </main>
      <Footer dict={dict.footer} />
    </>
  );
}
