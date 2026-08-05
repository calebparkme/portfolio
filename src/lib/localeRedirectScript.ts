import type { Locale } from "@/i18n/config";

const GEO_API = "https://get.geojs.io/v1/ip/country.json";
const GEO_TIMEOUT_MS = 3000;
const STORAGE_KEY = "preferredLocale";

// Bots must never be redirected: they should always see the exact page they
// requested so both locale URLs stay independently crawlable (hreflang
// already tells search engines how the two versions relate).
const BOT_PATTERN =
  "bot|crawl|spider|slurp|yeti|daum|baiduspider|duckduckbot|facebookexternalhit";

/**
 * Builds an inline, pre-hydration script that:
 * 1. Skips known bots entirely.
 * 2. Skips the check on same-site navigation (e.g. clicking the EN/KO
 *    toggle) so an explicit choice is never fought by auto-redirect logic.
 * 3. On a fresh visit, uses the remembered locale (localStorage) if any.
 * 4. Otherwise (first-ever visit, English entry point only), looks up the
 *    visitor's country via a keyless client-side geolocation API and routes
 *    Korean visitors to /ko/. Any failure/timeout falls back to English.
 */
export function buildLocaleRedirectScript(locale: Locale): string {
  const otherLocale: Locale = locale === "en" ? "ko" : "en";
  const otherPath = locale === "en" ? "/ko/" : "/";

  const firstVisitBehavior =
    locale === "en"
      ? `
      var ctrl = new AbortController();
      var timer = setTimeout(function () { ctrl.abort(); }, ${GEO_TIMEOUT_MS});
      fetch(${JSON.stringify(GEO_API)}, { signal: ctrl.signal })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          clearTimeout(timer);
          var next = data && data.country === "KR" ? "ko" : "en";
          try { localStorage.setItem(KEY, next); } catch (e) {}
          if (next === ${JSON.stringify(otherLocale)}) location.replace(${JSON.stringify(otherPath)});
        })
        .catch(function () {
          clearTimeout(timer);
          try { localStorage.setItem(KEY, "en"); } catch (e) {}
        });
      `
      : `
      try { localStorage.setItem(KEY, ${JSON.stringify(locale)}); } catch (e) {}
      `;

  return `
(function () {
  try {
    var KEY = ${JSON.stringify(STORAGE_KEY)};
    if (new RegExp(${JSON.stringify(BOT_PATTERN)}, "i").test(navigator.userAgent || "")) return;

    var sameSiteRef = document.referrer && document.referrer.indexOf(location.host) !== -1;
    if (sameSiteRef) {
      try { localStorage.setItem(KEY, ${JSON.stringify(locale)}); } catch (e) {}
      return;
    }

    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}

    if (saved === ${JSON.stringify(otherLocale)}) {
      location.replace(${JSON.stringify(otherPath)});
      return;
    }
    if (saved === ${JSON.stringify(locale)}) return;
    ${firstVisitBehavior}
  } catch (e) {}
})();
`;
}
