import { cookies } from "next/headers";

import { LOCALE_COOKIE_NAME, isSupportedLocale, type Locale } from "./i18n";

export async function getCurrentLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  return isSupportedLocale(cookieLocale) ? cookieLocale : "es";
}
