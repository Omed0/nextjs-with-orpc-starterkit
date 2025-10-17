"use server";

import { cookies } from "next/headers";
import { COOKIE_NAME, defaultLocale, type Locale } from "@/i18n/config";

export async function getUserLocale() {
  return (await cookies()).get(COOKIE_NAME)?.value || defaultLocale;
}

export async function setUserLocale(locale: Locale) {
  (await cookies()).set(COOKIE_NAME, locale);
}
