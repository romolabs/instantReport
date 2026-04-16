import { NextResponse } from "next/server";

import { getApiBaseUrl } from "@/lib/backend";

export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch(`${getApiBaseUrl()}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
    cache: "no-store"
  });

  const payload = await response.json().catch(() => ({
    message: "Unable to reset the password."
  }));

  return NextResponse.json(payload, { status: response.status });
}
