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

export type UserRole = PublicUser["role"];

export interface CreateUserInput {
  fullName: string;
  email: string;
  password: string;
  department?: string;
  role?: UserRole;
}

export interface UpdateUserInput {
  fullName?: string;
  department?: string;
  role?: UserRole;
  isActive?: boolean;
}

export const USER_ROLE_OPTIONS = [
  { value: "REQUESTER", label: "Requester" },
  { value: "TECHNICIAN", label: "Technician" },
  { value: "ADMIN", label: "Admin" }
] as const satisfies readonly { value: UserRole; label: string }[];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  REQUESTER: "Requester",
  TECHNICIAN: "Technician",
  ADMIN: "Admin"
};
