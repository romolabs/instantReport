import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend";

export async function GET() {
  const response = await backendFetch("/categories");

  const payload = await response.json().catch(() => ({
    message: "Unable to load categories"
  }));

  return NextResponse.json(payload, { status: response.status });
}

export async function POST(request: Request) {
  const body = await request.json();
  const response = await backendFetch("/categories", {
    method: "POST",
    body: JSON.stringify(body)
  });

  const payload = await response.json().catch(() => ({
    message: "Unable to create category"
  }));

  return NextResponse.json(payload, { status: response.status });
}
