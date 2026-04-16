import assert from "node:assert/strict";

const baseUrl = (process.env.API_BASE_URL ?? "http://127.0.0.1:4000/api").replace(/\/$/, "");
const adminEmail = process.env.SMOKE_ADMIN_EMAIL ?? "admin@example.com";
const adminPassword = process.env.SMOKE_ADMIN_PASSWORD ?? "ChangeMe123!";

async function apiFetch(path, { token, json, body, headers, ...init } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...(json ? { "content-type": "application/json" } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: json ? JSON.stringify(json) : body
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${init.method ?? "GET"} ${path} failed: ${response.status} ${text}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

async function main() {
  console.log(`Running smoke test against ${baseUrl}`);

  const login = await apiFetch("/auth/login", {
    method: "POST",
    json: {
      email: adminEmail,
      password: adminPassword
    }
  });

  assert.ok(login.accessToken, "login should return an access token");
  assert.equal(login.user.email, adminEmail);

  const me = await apiFetch("/auth/me", {
    token: login.accessToken
  });

  assert.equal(me.email, adminEmail);

  const categories = await apiFetch("/categories", {
    token: login.accessToken
  });

  assert.ok(Array.isArray(categories) && categories.length > 0, "expected seeded categories");
  const activeCategory = categories.find((entry) => entry.isActive);
  assert.ok(activeCategory, "expected at least one active category");

  const runId = Date.now();
  const ticket = await apiFetch("/tickets", {
    method: "POST",
    token: login.accessToken,
    json: {
      title: `Smoke test ticket ${runId}`,
      description: `Automated API smoke test run ${runId}`,
      categoryId: activeCategory.id,
      priority: "HIGH",
      location: "QA bench",
      assetTag: `SMOKE-${runId}`
    }
  });

  assert.equal(ticket.status, "OPEN");
  assert.equal(ticket.category.id, activeCategory.id);

  const attachmentBody = new FormData();
  attachmentBody.append(
    "file",
    new Blob([`%PDF-1.4\n% Smoke attachment ${runId}\n`], { type: "application/pdf" }),
    `smoke-${runId}.pdf`
  );

  const attachment = await apiFetch(`/tickets/${ticket.id}/attachments`, {
    method: "POST",
    token: login.accessToken,
    body: attachmentBody
  });

  assert.ok(
    attachment.attachments.some((entry) => entry.fileName.includes(`smoke-${runId}`)),
    "uploaded attachment should appear on the ticket"
  );

  await apiFetch(`/tickets/${ticket.id}/comments`, {
    method: "POST",
    token: login.accessToken,
    json: {
      body: "Smoke test comment from the API harness."
    }
  });

  await apiFetch(`/tickets/${ticket.id}/assign`, {
    method: "PATCH",
    token: login.accessToken,
    json: {
      assignedToId: login.user.id,
      note: "Assigned during smoke test"
    }
  });

  await apiFetch(`/tickets/${ticket.id}/status`, {
    method: "PATCH",
    token: login.accessToken,
    json: {
      status: "IN_PROGRESS",
      note: "Work started by smoke test"
    }
  });

  await apiFetch(`/tickets/${ticket.id}/status`, {
    method: "PATCH",
    token: login.accessToken,
    json: {
      status: "RESOLVED",
      resolutionSummary: "Resolved by smoke test flow",
      note: "Marked resolved"
    }
  });

  await apiFetch(`/tickets/${ticket.id}/status`, {
    method: "PATCH",
    token: login.accessToken,
    json: {
      status: "IN_PROGRESS",
      reopenReason: "Validation of reopen path",
      note: "Reopened by smoke test"
    }
  });

  await apiFetch(`/tickets/${ticket.id}/status`, {
    method: "PATCH",
    token: login.accessToken,
    json: {
      status: "CLOSED",
      resolutionSummary: "Closed by smoke test flow",
      note: "Final close from smoke test"
    }
  });

  const finalTicket = await apiFetch(`/tickets/${ticket.id}`, {
    token: login.accessToken
  });

  assert.equal(finalTicket.status, "CLOSED");
  assert.equal(finalTicket.assignedTo?.id, login.user.id);
  assert.equal(finalTicket.reopenReason, "Validation of reopen path");
  assert.equal(finalTicket.resolutionSummary, "Closed by smoke test flow");
  assert.ok(finalTicket.firstResponseAt, "first response timestamp should be set");
  assert.ok(finalTicket.closedAt, "closed timestamp should be set");
  assert.ok(finalTicket.attachments.length >= 1, "attachment should be recorded");
  assert.ok(finalTicket.comments.length >= 1, "comment should be recorded");
  assert.ok(finalTicket.statusHistory.length >= 4, "status transitions should be recorded");

  console.log(`Smoke test passed for ${finalTicket.ticketNumber}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
