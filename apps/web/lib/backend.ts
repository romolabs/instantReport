import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME } from "./session";

const DEFAULT_API_BASE_URL = "http://localhost:4000/api";

export function getApiBaseUrl() {
  return process.env.INSTANTREPORT_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

export function getBackendOrigin() {
  const explicitOrigin = process.env.INSTANTREPORT_PUBLIC_BACKEND_ORIGIN?.trim();

  if (explicitOrigin) {
    return explicitOrigin;
  }

  return new URL(getApiBaseUrl()).origin;
}

export function toBackendAssetUrl(path: string) {
  if (!path) {
    return path;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return new URL(path, getBackendOrigin()).toString();
}

export async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export async function backendFetch(
  path: string,
  init?: RequestInit & { token?: string | null }
) {
  const token = init?.token ?? (await getSessionToken());
  const headers = new Headers(init?.headers);
  const body = init?.body;
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Content-Type") && body && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
    cache: "no-store"
  });
}
