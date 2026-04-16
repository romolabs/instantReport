"use client";

import { startTransition, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  USER_ROLE_OPTIONS,
  type PublicUser,
  type CreateUserInput,
  type UpdateUserInput
} from "@/lib/user-types";
import {
  formatDateTime,
  getDictionary,
  interpolate,
  translateRole,
  type Locale
} from "@/lib/i18n";

import styles from "./admin-users-view.module.css";

interface AdminUsersViewProps {
  locale: Locale;
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

export function AdminUsersView({ locale, users }: AdminUsersViewProps) {
  const copy = getDictionary(locale).admin.users;
  const commonCopy = getDictionary(locale).common;
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
      setCreateError(copy.requiredError);
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
        setCreateError(responsePayload?.message ?? copy.createError);
        return;
      }

      setCreateState(initialCreateState);
      setCreateSuccess(interpolate(copy.createSuccess, { name: fullName }));

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setCreateError(copy.createServerError);
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
      setSaveMessage(copy.updateNameError);
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
        setSaveMessage(responsePayload?.message ?? copy.updateError);
        return;
      }

      setSaveMessage(interpolate(copy.updateSuccess, { name: fullName }));

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setSaveMessage(copy.updateServerError);
    } finally {
      setSavingUserId(null);
    }
  }

  return (
    <div className={styles.stack}>
      <section className={styles.panel}>
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.sectionLabel}>{copy.createLabel}</p>
            <h3>{copy.createTitle}</h3>
          </div>
          <p className={styles.helper}>{copy.createHelp}</p>
        </div>

        <form className={styles.formGrid} onSubmit={handleCreateSubmit}>
          <label className={styles.field}>
            <span>{copy.fields.fullName}</span>
            <input
              type="text"
              name="fullName"
              placeholder={copy.placeholders.fullName}
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
            <span>{copy.fields.email}</span>
            <input
              type="email"
              name="email"
              placeholder={copy.placeholders.email}
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
            <span>{copy.fields.password}</span>
            <input
              type="password"
              name="password"
              placeholder={copy.placeholders.password}
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
            <span>{copy.fields.department}</span>
            <input
              type="text"
              name="department"
              placeholder={copy.placeholders.department}
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
            <span>{copy.fields.role}</span>
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
                  {translateRole(locale, option.value)}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.field}>
            <span>{copy.accessNoteTitle}</span>
            <p className={styles.helper}>{copy.accessNote}</p>
          </div>

          <div className={styles.actions}>
            <button type="submit" disabled={isCreating}>
              {isCreating ? copy.creatingAction : copy.createAction}
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
            <p className={styles.sectionLabel}>{copy.directoryLabel}</p>
            <h3>{copy.directoryTitle}</h3>
          </div>
          <div className={styles.summaryGrid}>
            <article className={styles.summaryCard}>
              <span>{copy.activeUsers}</span>
              <strong>{activeCount}</strong>
            </article>
            <article className={styles.summaryCard}>
              <span>{copy.admins}</span>
              <strong>{adminCount}</strong>
            </article>
            <article className={styles.summaryCard}>
              <span>{copy.technicians}</span>
              <strong>{technicianCount}</strong>
            </article>
          </div>
        </div>

        {users.length === 0 ? (
          <article className={styles.emptyState}>{copy.empty}</article>
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
                      {translateRole(locale, user.role)}
                    </span>
                    <span
                      className={`${styles.badge} ${statusBadgeClass(
                        user.isActive
                      )}`}
                    >
                      {user.isActive ? commonCopy.active : commonCopy.inactive}
                    </span>
                  </div>
                </div>

                <div className={styles.meta}>
                  <article>
                    <span>{copy.department}</span>
                    <strong>{user.department ?? commonCopy.notSet}</strong>
                  </article>
                  <article>
                    <span>{copy.lastLogin}</span>
                    <strong>
                      {user.lastLoginAt ? formatDateTime(locale, user.lastLoginAt) : commonCopy.never}
                    </strong>
                  </article>
                  <article>
                    <span>{copy.updated}</span>
                    <strong>{formatDateTime(locale, user.updatedAt)}</strong>
                  </article>
                </div>

                <form
                  className={styles.editGrid}
                  data-user-id={user.id}
                  onSubmit={handleUpdateSubmit}
                >
                  <label className={styles.field}>
                    <span>{copy.fields.fullName}</span>
                    <input
                      type="text"
                      name="fullName"
                      defaultValue={user.fullName}
                    />
                  </label>

                  <label className={styles.field}>
                    <span>{copy.fields.department}</span>
                    <input
                      type="text"
                      name="department"
                      defaultValue={user.department ?? ""}
                    />
                  </label>

                  <label className={styles.field}>
                    <span>{copy.fields.role}</span>
                    <select name="role" defaultValue={user.role}>
                      {USER_ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {translateRole(locale, option.value)}
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
                    <span>{copy.activeAccount}</span>
                  </label>

                  <div className={styles.cardFooter}>
                    <p className={styles.helper}>{copy.cardHelp}</p>
                    <div className={styles.actions}>
                      <button type="submit" disabled={savingUserId === user.id}>
                        {savingUserId === user.id
                          ? copy.savingAction
                          : copy.saveAction}
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
