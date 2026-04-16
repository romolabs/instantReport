import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ ticketId: string }> }
) {
  const { ticketId } = await context.params;
  const body = await request.json();
  const response = await backendFetch(
    `/tickets/${encodeURIComponent(ticketId)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(body)
    }
  );

  const payload = await response.json().catch(() => ({
    message: "Unable to update ticket status"
  }));

  return NextResponse.json(payload, { status: response.status });
}
