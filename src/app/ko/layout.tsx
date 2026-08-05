import type { Metadata } from "next";
import Script from "next/script";
import "../globals.css";
import { geistSans, geistMono } from "@/lib/fonts";
import { buildMetadata } from "@/lib/metadata";
import { buildPersonJsonLd } from "@/lib/jsonld";
import { buildLocaleRedirectScript } from "@/lib/localeRedirectScript";

export const metadata: Metadata = buildMetadata("ko");

const personJsonLd = buildPersonJsonLd("ko");
const localeRedirectScript = buildLocaleRedirectScript("ko");

export default function KoRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-neutral-900">
        <Script id="locale-redirect" strategy="beforeInteractive">
          {localeRedirectScript}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
