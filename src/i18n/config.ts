export type Locale = (typeof locales)[number];

export const locales = ["ckb", "en", "ar"] as const;
export const defaultLocale: Locale = "ckb";

// Define RTL locales
const rtlLocales: Locale[] = ["ckb", "ar"];
export const isRTLLocale = (locale: string) =>
  rtlLocales.includes(locale as Locale);

// In this example the locale is read from a cookie. You could alternatively
// also read it from a database, backend service, or any other source.
export const COOKIE_NAME = "NEXT_LOCALE";

export const fullname_locales = [
  { code: "ckb", name: "کوردی" },
  { code: "en", name: "English" },
  { code: "ar", name: "العربية" },
  // Add more locales as needed
] as const;
