import { backendFetch } from "./backend";
export type { CreateUserInput, PublicUser, UpdateUserInput, UserRole } from "./user-types";
export { USER_ROLE_LABELS, USER_ROLE_OPTIONS } from "./user-types";
import type { PublicUser } from "./user-types";

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
