import { backendFetch } from "./backend";

export interface PublicUser {
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

export async function getUsers() {
  const response = await backendFetch("/users");

  if (!response.ok) {
    throw new Error("Unable to load users");
  }

  return (await response.json()) as PublicUser[];
}

export async function getAssignableUsers() {
  const users = await getUsers();

  return users.filter(
    (user) => user.isActive && (user.role === "TECHNICIAN" || user.role === "ADMIN")
  );
}
