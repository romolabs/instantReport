import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend";
import type { UpdateUserInput } from "@/lib/users";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;
  const body = (await request.json().catch(() => null)) as UpdateUserInput | null;

  if (!body) {
    return NextResponse.json(
      { message: "Unable to update user" },
      { status: 400 }
    );
  }

  const response = await backendFetch(`/users/${encodeURIComponent(userId)}`, {
    method: "PATCH",
    body: JSON.stringify(body)
  });

  const payload = await response.json().catch(() => ({
    message: "Unable to update user"
  }));

  return NextResponse.json(payload, { status: response.status });
}
