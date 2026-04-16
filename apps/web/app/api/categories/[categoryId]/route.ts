import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await context.params;
  const body = await request.json();
  const response = await backendFetch(`/categories/${encodeURIComponent(categoryId)}`, {
    method: "PATCH",
    body: JSON.stringify(body)
  });

  const payload = await response.json().catch(() => ({
    message: "Unable to update category"
  }));

  return NextResponse.json(payload, { status: response.status });
}
