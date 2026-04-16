import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL ?? "admin@example.com";
const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? "ChangeMe123!";
const apiBaseUrl = process.env.E2E_API_BASE_URL ?? "http://127.0.0.1:4000/api";

async function apiJson<T>(
  request: APIRequestContext,
  path: string,
  init?: Parameters<APIRequestContext["fetch"]>[1]
) {
  const response = await request.fetch(`${apiBaseUrl}${path}`, init);
  const payload = (await response.json().catch(() => null)) as T | null;

  expect(response.ok(), `${init?.method ?? "GET"} ${path} should succeed`).toBeTruthy();

  return payload as T;
}

async function loginToApi(request: APIRequestContext) {
  return apiJson<{
    accessToken: string;
    user: { id: string };
  }>(request, "/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    data: {
      email: adminEmail,
      password: adminPassword
    }
  });
}

async function createClosedTicket(request: APIRequestContext) {
  const login = await loginToApi(request);
  const headers = {
    Authorization: `Bearer ${login.accessToken}`,
    "Content-Type": "application/json"
  };
  const categories = await apiJson<Array<{ id: string; isActive: boolean }>>(
    request,
    "/categories",
    { headers: { Authorization: `Bearer ${login.accessToken}` } }
  );
  const categoryId = categories.find((category) => category.isActive)?.id;

  expect(categoryId, "expected at least one active category").toBeTruthy();

  const runId = Date.now();
  const ticket = await apiJson<{
    id: string;
    ticketNumber: string;
    status: string;
  }>(request, "/tickets", {
    method: "POST",
    headers,
    data: {
      title: `Web E2E detail flow ${runId}`,
      description: `Ticket created by Playwright run ${runId}`,
      categoryId,
      priority: "HIGH",
      location: "Operations desk",
      assetTag: `WEB-E2E-${runId}`
    }
  });

  await apiJson(request, `/tickets/${ticket.id}/status`, {
    method: "PATCH",
    headers,
    data: {
      status: "CLOSED",
      resolutionSummary: `Closed during Playwright setup ${runId}`,
      note: "Seeded for detail-page regression coverage"
    }
  });

  return {
    accessToken: login.accessToken,
    ticketNumber: ticket.ticketNumber
  };
}

async function loginToWeb(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(adminEmail);
  await page.getByLabel("Password").fill(adminPassword);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/tickets$/);
}

test("closed ticket requires a reopen reason before staff can move it back to resolved", async ({
  page,
  request
}) => {
  const { accessToken, ticketNumber } = await createClosedTicket(request);
  const reopenReason = `Additional validation required ${Date.now()}`;

  await loginToWeb(page);
  await page.goto(`/tickets/${ticketNumber}`);

  await page.getByLabel("Close-out target").selectOption("RESOLVED");
  const saveCloseout = page.getByRole("button", { name: "Save close-out" });
  const closeoutReopenReason = page.getByPlaceholder(
    "Required when reopening a closed ticket into resolved work."
  );

  await expect(saveCloseout).toBeDisabled();

  await closeoutReopenReason.fill(reopenReason);
  await expect(saveCloseout).toBeEnabled();

  await saveCloseout.click();

  await expect
    .poll(async () => {
      const ticket = await apiJson<{
        status: string;
        reopenReason: string | null;
      }>(request, `/tickets/${ticketNumber}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      return `${ticket.status}:${ticket.reopenReason ?? ""}`;
    })
    .toBe(`RESOLVED:${reopenReason}`);
});

test("detail page uploads a new attachment and renders it in the evidence list", async ({
  page,
  request
}) => {
  const { accessToken, ticketNumber } = await createClosedTicket(request);
  const fileName = `detail-evidence-${Date.now()}.pdf`;

  await loginToWeb(page);
  await page.goto(`/tickets/${ticketNumber}`);

  await page.locator('input[type="file"]').setInputFiles({
    name: fileName,
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF")
  });

  await page.getByRole("button", { name: "Upload attachments" }).click();

  await expect(page.getByText(fileName)).toBeVisible();
  await expect
    .poll(async () => {
      const ticket = await apiJson<{
        attachments: Array<{ fileName: string }>;
      }>(request, `/tickets/${ticketNumber}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      return ticket.attachments.some((attachment) => attachment.fileName === fileName);
    })
    .toBeTruthy();
});
