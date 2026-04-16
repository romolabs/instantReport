"use client";

import { startTransition, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import type { CategoryRecord } from "@/lib/category-types";

import styles from "./category-management-panel.module.css";

interface CategoryManagementPanelProps {
  categories: CategoryRecord[];
}

interface CategoryResponse {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function getErrorMessage(payload: CategoryResponse | { message?: string } | null) {
  return payload && "message" in payload ? payload.message : undefined;
}

function isCategoryResponse(
  payload: CategoryResponse | { message?: string } | null
): payload is CategoryResponse {
  return Boolean(payload && "id" in payload);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatRelativeTime(value: string) {
  const diffMinutes = Math.floor((Date.now() - new Date(value).getTime()) / 60000);

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `Updated ${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `Updated ${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `Updated ${diffDays}d ago`;
}

export function CategoryManagementPanel({ categories }: CategoryManagementPanelProps) {
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id ?? "");
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIsActive, setEditIsActive] = useState(true);
  const [createError, setCreateError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [createBusy, setCreateBusy] = useState(false);
  const [updateBusy, setUpdateBusy] = useState(false);

  const selectedCategory =
    categories.find((category) => category.id === selectedCategoryId) ?? null;

  useEffect(() => {
    if (categories.length === 0) {
      setSelectedCategoryId("");
      return;
    }

    if (!selectedCategoryId || !categories.some((category) => category.id === selectedCategoryId)) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  useEffect(() => {
    if (!selectedCategory) {
      setEditName("");
      setEditDescription("");
      setEditIsActive(true);
      return;
    }

    setEditName(selectedCategory.name);
    setEditDescription(selectedCategory.description ?? "");
    setEditIsActive(selectedCategory.isActive);
  }, [selectedCategory]);

  const activeCount = categories.filter((category) => category.isActive).length;
  const inactiveCount = categories.length - activeCount;
  const createDisabled = createBusy || !createName.trim();
  const hasUpdates =
    !!selectedCategory &&
    (editName.trim() !== selectedCategory.name ||
      editDescription.trim() !== (selectedCategory.description ?? "") ||
      editIsActive !== selectedCategory.isActive);
  const updateDisabled = updateBusy || !selectedCategory || !editName.trim() || !hasUpdates;

  async function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (createDisabled) {
      return;
    }

    setCreateBusy(true);
    setCreateError(null);
    setStatusMessage(null);

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: createName,
          description: createDescription.trim() || undefined
        })
      });

      const payload = (await response.json().catch(() => null)) as
        | CategoryResponse
        | { message?: string }
        | null;

      if (!response.ok) {
        setCreateError(getErrorMessage(payload) ?? "Unable to create category.");
        return;
      }

      setCreateName("");
      setCreateDescription("");
      setSelectedCategoryId(isCategoryResponse(payload) ? payload.id : "");
      setStatusMessage(
        `Created ${isCategoryResponse(payload) ? payload.name : "category"}.`
      );

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setCreateError("Unable to reach the server right now.");
    } finally {
      setCreateBusy(false);
    }
  }

  async function handleUpdateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (updateDisabled || !selectedCategory) {
      return;
    }

    setUpdateBusy(true);
    setUpdateError(null);
    setStatusMessage(null);

    try {
      const response = await fetch(
        `/api/categories/${encodeURIComponent(selectedCategory.id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: editName,
            description: editDescription.trim() || undefined,
            isActive: editIsActive
          })
        }
      );

      const payload = (await response.json().catch(() => null)) as
        | CategoryResponse
        | { message?: string }
        | null;

      if (!response.ok) {
        setUpdateError(getErrorMessage(payload) ?? "Unable to update category.");
        return;
      }

      if (isCategoryResponse(payload)) {
        setSelectedCategoryId(payload.id);
        setEditName(payload.name);
        setEditDescription(payload.description ?? "");
        setEditIsActive(payload.isActive);
        setStatusMessage(`Updated ${payload.name}.`);
      } else {
        setStatusMessage(`Updated ${selectedCategory.name}.`);
      }

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setUpdateError("Unable to reach the server right now.");
    } finally {
      setUpdateBusy(false);
    }
  }

  return (
    <div className={styles.board}>
      <section className={styles.library}>
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.sectionLabel}>Category library</p>
            <h2>All request categories</h2>
          </div>
          <p className={styles.sectionCopy}>
            Edit the catalog here, then let ticket intake inherit the updated
            taxonomy automatically.
          </p>
        </div>

        {statusMessage ? <p className={styles.successMessage}>{statusMessage}</p> : null}

        {categories.length > 0 ? (
          <div className={styles.categoryList}>
            {categories.map((category) => {
              const isSelected = category.id === selectedCategoryId;

              return (
                <article
                  key={category.id}
                  className={`${styles.categoryCard} ${isSelected ? styles.categoryCardSelected : ""}`}
                >
                  <div className={styles.categoryTop}>
                    <div>
                      <p className={styles.categoryStatus}>
                        {category.isActive ? "Active" : "Inactive"}
                      </p>
                      <h3>{category.name}</h3>
                    </div>

                    <button
                      type="button"
                      className={styles.secondaryAction}
                      onClick={() => setSelectedCategoryId(category.id)}
                    >
                      {isSelected ? "Selected" : "Edit"}
                    </button>
                  </div>

                  <p className={styles.categoryDescription}>
                    {category.description ?? "No description provided."}
                  </p>

                  <div className={styles.badgeRow}>
                    <span className={category.isActive ? styles.activeBadge : styles.inactiveBadge}>
                      {category.isActive ? "Visible in intake" : "Hidden from intake"}
                    </span>
                    <span>{formatRelativeTime(category.updatedAt)}</span>
                  </div>

                  <div className={styles.categoryMeta}>
                    <span>Created {formatDateTime(category.createdAt)}</span>
                    <span>Updated {formatDateTime(category.updatedAt)}</span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h3>No categories yet</h3>
            <p>Use the create form to add the first request category.</p>
          </div>
        )}
      </section>

      <aside className={styles.panelColumn}>
        <section className={styles.panel}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.sectionLabel}>Create category</p>
              <h2>New intake label</h2>
            </div>
            <p className={styles.sectionCopy}>
              Keep names short, descriptive, and easy for requesters to choose.
            </p>
          </div>

          <form className={styles.form} onSubmit={handleCreateSubmit}>
            <label className={styles.field}>
              <span>Name</span>
              <input
                type="text"
                placeholder="Example: Software access"
                value={createName}
                onChange={(event) => setCreateName(event.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span>Description</span>
              <textarea
                placeholder="Short helper text for the ticket form."
                value={createDescription}
                onChange={(event) => setCreateDescription(event.target.value)}
                rows={4}
              />
              <small>Optional. Leave blank if the name is already clear enough.</small>
            </label>

            {createError ? <p className={styles.errorMessage}>{createError}</p> : null}

            <div className={styles.actions}>
              <button type="submit" className={styles.primaryAction} disabled={createDisabled}>
                {createBusy ? "Creating..." : "Create category"}
              </button>
            </div>
          </form>
        </section>

        <section className={styles.panel}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.sectionLabel}>Edit category</p>
              <h2>Selected category</h2>
            </div>
            <p className={styles.sectionCopy}>
              Update the current entry or retire it without deleting historical tickets.
            </p>
          </div>

          {selectedCategory ? (
            <form className={styles.form} onSubmit={handleUpdateSubmit}>
              <div className={styles.selectedSummary}>
                <div>
                  <span>Editing</span>
                  <strong>{selectedCategory.name}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{selectedCategory.isActive ? "Active" : "Inactive"}</strong>
                </div>
              </div>

              <label className={styles.field}>
                <span>Name</span>
                <input
                  type="text"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                />
              </label>

              <label className={styles.field}>
                <span>Description</span>
                <textarea
                  value={editDescription}
                  onChange={(event) => setEditDescription(event.target.value)}
                  rows={4}
                />
                <small>
                  Requesters will see this text in intake wherever the category is offered.
                </small>
              </label>

              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={editIsActive}
                  onChange={(event) => setEditIsActive(event.target.checked)}
                />
                <span>Keep category available in ticket creation</span>
              </label>

              {updateError ? <p className={styles.errorMessage}>{updateError}</p> : null}

              <div className={styles.actions}>
                <button type="submit" className={styles.primaryAction} disabled={updateDisabled}>
                  {updateBusy ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.emptyState}>
              <h3>Select a category</h3>
              <p>Click Edit on any category to load it here.</p>
            </div>
          )}
        </section>
      </aside>
    </div>
  );
}
