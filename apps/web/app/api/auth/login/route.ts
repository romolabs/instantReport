import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getApiBaseUrl } from "@/lib/backend";
import { SESSION_COOKIE_NAME } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
    cache: "no-store"
  });

  const payload = await response.json().catch(() => ({
    message: "Login failed"
  }));

  if (!response.ok) {
    return NextResponse.json(payload, { status: response.status });
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, payload.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });

  return NextResponse.json({ user: payload.user });
}
