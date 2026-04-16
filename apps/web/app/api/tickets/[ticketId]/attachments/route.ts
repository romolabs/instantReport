import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend";

export async function POST(
  request: Request,
  context: { params: Promise<{ ticketId: string }> }
) {
  const { ticketId } = await context.params;
  const formData = await request.formData();
  const response = await backendFetch(
    `/tickets/${encodeURIComponent(ticketId)}/attachments`,
    {
      method: "POST",
      body: formData
    }
  );

  const payload = await response.json().catch(() => ({
    message: "Attachment upload failed"
  }));

  return NextResponse.json(payload, { status: response.status });
}
