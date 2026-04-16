import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend";

export async function POST(request: Request) {
  const body = await request.json();
  const response = await backendFetch("/tickets", {
    method: "POST",
    body: JSON.stringify(body)
  });

  const payload = await response.json().catch(() => ({
    message: "Ticket creation failed"
  }));

  return NextResponse.json(payload, { status: response.status });
}
