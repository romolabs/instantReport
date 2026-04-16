import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend";

export async function POST(
  request: Request,
  context: { params: Promise<{ ticketId: string }> }
) {
  const { ticketId } = await context.params;
  const body = await request.json();
  const response = await backendFetch(
    `/tickets/${encodeURIComponent(ticketId)}/comments`,
    {
      method: "POST",
      body: JSON.stringify(body)
    }
  );

  const payload = await response.json().catch(() => ({
    message: "Unable to add comment"
  }));

  return NextResponse.json(payload, { status: response.status });
}
