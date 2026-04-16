import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { LOCALE_COOKIE_NAME, isSupportedLocale } from "@/lib/i18n";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | { locale?: string }
    | null;

  if (!isSupportedLocale(payload?.locale)) {
    return NextResponse.json({ message: "Invalid locale." }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, payload.locale, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });

  return NextResponse.json({ locale: payload.locale });
}
