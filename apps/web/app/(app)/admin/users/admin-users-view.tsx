"use client";

import { startTransition, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  USER_ROLE_LABELS,
  USER_ROLE_OPTIONS,
  type PublicUser,
  type CreateUserInput,
  type UpdateUserInput
} from "@/lib/user-types";

import styles from "./admin-users-view.module.css";

interface AdminUsersViewProps {
  users: PublicUser[];
}

type CreateFormState = {
  fullName: string;
  email: string;
  password: string;
  department: string;
  role: PublicUser["role"];
};

const initialCreateState: CreateFormState = {
  fullName: "",
  email: "",
  password: "",
  department: "",
  role: "REQUESTER"
};

function formatDateTime(input: string | null) {
  if (!input) {
    return "Never";
  }

  return new Date(input).toLocaleString();
}

function roleBadgeClass(role: PublicUser["role"]) {
  return role === "REQUESTER"
    ? styles.badgeInactive
    : styles.badgeRole;
}

function statusBadgeClass(isActive: boolean) {
  return isActive ? styles.badgeActive : styles.badgeInactive;
}

function normalizeOptionalField(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function AdminUsersView({ users }: AdminUsersViewProps) {
  const router = useRouter();
  const [createState, setCreateState] =
    useState<CreateFormState>(initialCreateState);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const activeCount = users.filter((user) => user.isActive).length;
  const adminCount = users.filter((user) => user.role === "ADMIN").length;
  const technicianCount = users.filter(
    (user) => user.role === "TECHNICIAN"
  ).length;

  async function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isCreating) {
      return;
    }

    const fullName = createState.fullName.trim();
    const email = createState.email.trim();
    const password = createState.password.trim();

    if (!fullName || !email || !password) {
      setCreateError("Full name, email, and password are required.");
      return;
    }

    setIsCreating(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const payload: CreateUserInput = {
        fullName,
        email,
        password,
        department: createState.department.trim() || undefined,
        role: createState.role
      };

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const responsePayload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setCreateError(
          responsePayload?.message ?? "Unable to create the user."
        );
        return;
      }

      setCreateState(initialCreateState);
      setCreateSuccess(`Created ${fullName}.`);

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setCreateError("Unable to reach the server right now.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleUpdateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const userId = form.dataset.userId;

    if (!userId || savingUserId) {
      return;
    }

    const formData = new FormData(form);
    const fullName = String(formData.get("fullName") ?? "").trim();

    if (!fullName) {
      setSaveMessage("Full name cannot be empty.");
      return;
    }

    const payload: UpdateUserInput = {
      fullName,
      department: normalizeOptionalField(formData.get("department")),
      role: String(formData.get("role")) as PublicUser["role"],
      isActive: formData.get("isActive") === "on"
    };

    setSavingUserId(userId);
    setSaveMessage(null);

    try {
      const response = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const responsePayload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setSaveMessage(responsePayload?.message ?? "Unable to update user.");
        return;
      }

      setSaveMessage(`Saved changes for ${fullName}.`);

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setSaveMessage("Unable to reach the server right now.");
    } finally {
      setSavingUserId(null);
    }
  }

  return (
    <div className={styles.stack}>
      <section className={styles.panel}>
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.sectionLabel}>Create account</p>
            <h3>Provision identities without leaving the admin shell.</h3>
          </div>
          <p className={styles.helper}>
            New users are created through the same backend directory the ticket
            workflow reads from.
          </p>
        </div>

        <form className={styles.formGrid} onSubmit={handleCreateSubmit}>
          <label className={styles.field}>
            <span>Full name</span>
            <input
              type="text"
              name="fullName"
              placeholder="Ava Johnson"
              value={createState.fullName}
              onChange={(event) =>
                setCreateState((current) => ({
                  ...current,
                  fullName: event.target.value
                }))
              }
            />
          </label>

          <label className={styles.field}>
            <span>Email</span>
            <input
              type="email"
              name="email"
              placeholder="ava@company.com"
              value={createState.email}
              onChange={(event) =>
                setCreateState((current) => ({
                  ...current,
                  email: event.target.value
                }))
              }
            />
          </label>

          <label className={styles.field}>
            <span>Password</span>
            <input
              type="password"
              name="password"
              placeholder="Minimum 8 characters"
              value={createState.password}
              onChange={(event) =>
                setCreateState((current) => ({
                  ...current,
                  password: event.target.value
                }))
              }
            />
          </label>

          <label className={styles.field}>
            <span>Department</span>
            <input
              type="text"
              name="department"
              placeholder="Finance, Support, or Operations"
              value={createState.department}
              onChange={(event) =>
                setCreateState((current) => ({
                  ...current,
                  department: event.target.value
                }))
              }
            />
          </label>

          <label className={styles.field}>
            <span>Role</span>
            <select
              name="role"
              value={createState.role}
              onChange={(event) =>
                setCreateState((current) => ({
                  ...current,
                  role: event.target.value as PublicUser["role"]
                }))
              }
            >
              {USER_ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.field}>
            <span>Access note</span>
            <p className={styles.helper}>
              Requesters can submit tickets. Technicians and admins can be
              assigned and can manage queue actions.
            </p>
          </div>

          <div className={styles.actions}>
            <button type="submit" disabled={isCreating}>
              {isCreating ? "Creating user..." : "Create user"}
            </button>
          </div>
        </form>

        {createError ? <p className={styles.message}>{createError}</p> : null}
        {createSuccess ? (
          <p className={`${styles.message} ${styles.successMessage}`}>
            {createSuccess}
          </p>
        ) : null}
      </section>

      <section className={styles.panel}>
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.sectionLabel}>Directory</p>
            <h3>Keep names, roles, and activity flags aligned with the backend.</h3>
          </div>
          <div className={styles.summaryGrid}>
            <article className={styles.summaryCard}>
              <span>Active accounts</span>
              <strong>{activeCount}</strong>
            </article>
            <article className={styles.summaryCard}>
              <span>Admins</span>
              <strong>{adminCount}</strong>
            </article>
            <article className={styles.summaryCard}>
              <span>Technicians</span>
              <strong>{technicianCount}</strong>
            </article>
          </div>
        </div>

        {users.length === 0 ? (
          <article className={styles.emptyState}>
            No users exist yet. Create the first account above to seed the
            directory.
          </article>
        ) : (
          <div className={styles.userList}>
            {users.map((user) => (
              <article key={user.id} className={styles.userCard}>
                <div className={styles.userHeader}>
                  <div>
                    <p className={styles.cardLabel}>{user.email}</p>
                    <h4>{user.fullName}</h4>
                  </div>
                  <div className={styles.badgeStack}>
                    <span className={`${styles.badge} ${roleBadgeClass(user.role)}`}>
                      {USER_ROLE_LABELS[user.role]}
                    </span>
                    <span
                      className={`${styles.badge} ${statusBadgeClass(
                        user.isActive
                      )}`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className={styles.meta}>
                  <article>
                    <span>Department</span>
                    <strong>{user.department ?? "Not set"}</strong>
                  </article>
                  <article>
                    <span>Last login</span>
                    <strong>{formatDateTime(user.lastLoginAt)}</strong>
                  </article>
                  <article>
                    <span>Updated</span>
                    <strong>{formatDateTime(user.updatedAt)}</strong>
                  </article>
                </div>

                <form
                  className={styles.editGrid}
                  data-user-id={user.id}
                  onSubmit={handleUpdateSubmit}
                >
                  <label className={styles.field}>
                    <span>Full name</span>
                    <input
                      type="text"
                      name="fullName"
                      defaultValue={user.fullName}
                    />
                  </label>

                  <label className={styles.field}>
                    <span>Department</span>
                    <input
                      type="text"
                      name="department"
                      defaultValue={user.department ?? ""}
                    />
                  </label>

                  <label className={styles.field}>
                    <span>Role</span>
                    <select name="role" defaultValue={user.role}>
                      {USER_ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={styles.checkboxField}>
                    <input
                      type="checkbox"
                      name="isActive"
                      defaultChecked={user.isActive}
                    />
                    <span>Active account</span>
                  </label>

                  <div className={styles.cardFooter}>
                    <p className={styles.helper}>
                      Passwords are managed through the create flow. Status and
                      role changes update the same backend user record used by
                      ticket assignment.
                    </p>
                    <div className={styles.actions}>
                      <button type="submit" disabled={savingUserId === user.id}>
                        {savingUserId === user.id
                          ? "Saving..."
                          : "Save changes"}
                      </button>
                    </div>
                  </div>
                </form>
              </article>
            ))}
          </div>
        )}

        {saveMessage ? (
          <p className={`${styles.message} ${styles.successMessage}`}>
            {saveMessage}
          </p>
        ) : null}
      </section>
    </div>
  );
}
