"use client";

import { startTransition, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import {
  formatDateTime,
  formatRelativeDate,
  getDictionary,
  interpolate,
  type Locale
} from "@/lib/i18n";
import type { CategoryRecord } from "@/lib/category-types";

import styles from "./category-management-panel.module.css";

interface CategoryManagementPanelProps {
  locale: Locale;
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

export function CategoryManagementPanel({
  locale,
  categories
}: CategoryManagementPanelProps) {
  const copy = getDictionary(locale).admin.categories;
  const commonCopy = getDictionary(locale).common;
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
        setCreateError(getErrorMessage(payload) ?? copy.createError);
        return;
      }

      setCreateName("");
      setCreateDescription("");
      setSelectedCategoryId(isCategoryResponse(payload) ? payload.id : "");
      setStatusMessage(interpolate(copy.createSuccess, {
        name: isCategoryResponse(payload) ? payload.name : copy.fields.name
      }));

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setCreateError(copy.createServerError);
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
        setUpdateError(getErrorMessage(payload) ?? copy.updateError);
        return;
      }

      if (isCategoryResponse(payload)) {
        setSelectedCategoryId(payload.id);
        setEditName(payload.name);
        setEditDescription(payload.description ?? "");
        setEditIsActive(payload.isActive);
        setStatusMessage(interpolate(copy.updateSuccess, { name: payload.name }));
      } else {
        setStatusMessage(interpolate(copy.updateSuccess, { name: selectedCategory.name }));
      }

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setUpdateError(copy.updateServerError);
    } finally {
      setUpdateBusy(false);
    }
  }

  return (
    <div className={styles.board}>
      <section className={styles.library}>
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.sectionLabel}>{copy.libraryLabel}</p>
            <h2>{copy.libraryTitle}</h2>
          </div>
          <p className={styles.sectionCopy}>{copy.libraryCopy}</p>
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
                        {category.isActive ? commonCopy.active : commonCopy.inactive}
                      </p>
                      <h3>{category.name}</h3>
                    </div>

                    <button
                      type="button"
                      className={styles.secondaryAction}
                      onClick={() => setSelectedCategoryId(category.id)}
                    >
                      {isSelected ? copy.selectedAction : copy.editAction}
                    </button>
                  </div>

                  <p className={styles.categoryDescription}>
                    {category.description ?? copy.noDescription}
                  </p>

                  <div className={styles.badgeRow}>
                    <span className={category.isActive ? styles.activeBadge : styles.inactiveBadge}>
                      {category.isActive ? copy.activeBadge : copy.inactiveBadge}
                    </span>
                    <span>{formatRelativeDate(locale, category.updatedAt)}</span>
                  </div>

                  <div className={styles.categoryMeta}>
                    <span>
                      {interpolate(copy.createdAt, {
                        date: formatDateTime(locale, category.createdAt)
                      })}
                    </span>
                    <span>
                      {interpolate(copy.updatedAt, {
                        date: formatDateTime(locale, category.updatedAt)
                      })}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h3>{copy.emptyLibraryTitle}</h3>
            <p>{copy.emptyLibraryCopy}</p>
          </div>
        )}
      </section>

      <aside className={styles.panelColumn}>
        <section className={styles.panel}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.sectionLabel}>{copy.createLabel}</p>
              <h2>{copy.createTitle}</h2>
            </div>
            <p className={styles.sectionCopy}>{copy.createCopy}</p>
          </div>

          <form className={styles.form} onSubmit={handleCreateSubmit}>
            <label className={styles.field}>
              <span>{copy.fields.name}</span>
              <input
                type="text"
                placeholder={copy.placeholders.name}
                value={createName}
                onChange={(event) => setCreateName(event.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span>{copy.fields.description}</span>
              <textarea
                placeholder={copy.placeholders.description}
                value={createDescription}
                onChange={(event) => setCreateDescription(event.target.value)}
                rows={4}
              />
              <small>{copy.optionalDescription}</small>
            </label>

            {createError ? <p className={styles.errorMessage}>{createError}</p> : null}

            <div className={styles.actions}>
              <button type="submit" className={styles.primaryAction} disabled={createDisabled}>
                {createBusy ? copy.creatingAction : copy.createAction}
              </button>
            </div>
          </form>
        </section>

        <section className={styles.panel}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.sectionLabel}>{copy.editLabel}</p>
              <h2>{copy.editTitle}</h2>
            </div>
            <p className={styles.sectionCopy}>{copy.editCopy}</p>
          </div>

          {selectedCategory ? (
            <form className={styles.form} onSubmit={handleUpdateSubmit}>
              <div className={styles.selectedSummary}>
                <div>
                  <span>{copy.fields.editing}</span>
                  <strong>{selectedCategory.name}</strong>
                </div>
                <div>
                  <span>{copy.fields.status}</span>
                  <strong>{selectedCategory.isActive ? commonCopy.active : commonCopy.inactive}</strong>
                </div>
              </div>

              <label className={styles.field}>
                <span>{copy.fields.name}</span>
                <input
                  type="text"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                />
              </label>

              <label className={styles.field}>
                <span>{copy.fields.description}</span>
                <textarea
                  value={editDescription}
                  onChange={(event) => setEditDescription(event.target.value)}
                  rows={4}
                />
                <small>{copy.requesterDescription}</small>
              </label>

              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={editIsActive}
                  onChange={(event) => setEditIsActive(event.target.checked)}
                />
                <span>{copy.keepAvailable}</span>
              </label>

              {updateError ? <p className={styles.errorMessage}>{updateError}</p> : null}

              <div className={styles.actions}>
                <button type="submit" className={styles.primaryAction} disabled={updateDisabled}>
                  {updateBusy ? copy.savingAction : copy.saveAction}
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.emptyState}>
              <h3>{copy.emptySelectedTitle}</h3>
              <p>{copy.emptySelectedCopy}</p>
            </div>
          )}
        </section>
      </aside>
    </div>
  );
}
