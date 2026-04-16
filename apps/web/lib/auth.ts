import { redirect } from "next/navigation";

import { backendFetch, getSessionToken } from "./backend";

export interface AuthenticatedUser {
  id: string;
  fullName: string;
  email: string;
  department: string | null;
  role: "REQUESTER" | "TECHNICIAN" | "ADMIN";
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function isStaffRole(role: AuthenticatedUser["role"]) {
  return role === "TECHNICIAN" || role === "ADMIN";
}

export async function requireAuthenticatedUser() {
  const token = await getSessionToken();

  if (!token) {
    redirect("/login");
  }

  const response = await backendFetch("/auth/me", { token });

  if (!response.ok) {
    redirect("/login");
  }

  return (await response.json()) as AuthenticatedUser;
}

export async function requireStaffUser() {
  const user = await requireAuthenticatedUser();

  if (!isStaffRole(user.role)) {
    redirect("/tickets");
  }

  return user;
}

export async function requireAdminUser() {
  const user = await requireAuthenticatedUser();

  if (user.role !== "ADMIN") {
    redirect("/tickets");
  }

  return user;
}
