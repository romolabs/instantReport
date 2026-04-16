import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend";

export async function GET() {
  const response = await backendFetch("/users");

  const payload = await response.json().catch(() => ({
    message: "Unable to load users"
  }));

  return NextResponse.json(payload, { status: response.status });
}
