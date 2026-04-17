"use client";

import Link from "next/link";
import { startTransition, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { CameraIcon, PaperclipIcon } from "@/app/_components/upload-icons";
import type { CategoryOption } from "@/lib/categories";
import type { AppDictionary, Locale } from "@/lib/i18n";
import { translateStatus } from "@/lib/i18n";

import styles from "./create-ticket-form.module.css";

interface CreateTicketFormProps {
  categories: CategoryOption[];
  locale: Locale;
  copy: AppDictionary["tickets"]["create"];
}

interface CreatedTicketPayload {
  id: string;
  ticketNumber: string;
}

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function mergeFiles(current: File[], next: File[]) {
  const deduped = new Map(current.map((file) => [fileKey(file), file]));

  for (const file of next) {
    deduped.set(fileKey(file), file);
  }

  return Array.from(deduped.values());
}

export function CreateTicketForm({
  categories,
  locale,
  copy
}: CreateTicketFormProps) {
  const router = useRouter();
  const priorities = [
    { value: "LOW", label: translateStatus(locale, "LOW") },
    { value: "MEDIUM", label: translateStatus(locale, "MEDIUM") },
    { value: "HIGH", label: translateStatus(locale, "HIGH") },
    { value: "URGENT", label: translateStatus(locale, "URGENT") }
  ] as const;
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [priority, setPriority] =
    useState<(typeof priorities)[number]["value"]>("MEDIUM");
  const [location, setLocation] = useState("");
  const [assetTag, setAssetTag] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [createdTicketNumber, setCreatedTicketNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const disabled =
    isSubmitting ||
    Boolean(createdTicketNumber) ||
    !title.trim() ||
    !description.trim() ||
    !categoryId ||
    categories.length === 0;

  function handleFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const nextFiles = Array.from(event.target.files ?? []);

    if (nextFiles.length === 0) {
      return;
    }

    setFiles((current) => mergeFiles(current, nextFiles));
    setError(null);
    event.target.value = "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (disabled) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setCreatedTicketNumber(null);

    try {
      const createResponse = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          description,
          categoryId,
          priority,
          location,
          assetTag
        })
      });

      const createPayload = (await createResponse.json().catch(() => null)) as
        | ({ message?: string } & Partial<CreatedTicketPayload>)
        | null;

      if (!createResponse.ok || !createPayload?.id || !createPayload.ticketNumber) {
        setError(createPayload?.message ?? "Unable to create the ticket.");
        return;
      }

      const uploadFailures: string[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadResponse = await fetch(
          `/api/tickets/${createPayload.id}/attachments`,
          {
            method: "POST",
            body: formData
          }
        );

        const uploadPayload = (await uploadResponse.json().catch(() => null)) as
          | { message?: string }
          | null;

        if (!uploadResponse.ok) {
          uploadFailures.push(
            uploadPayload?.message
              ? `${file.name}: ${uploadPayload.message}`
              : file.name
          );
        }
      }

      if (uploadFailures.length > 0) {
        setCreatedTicketNumber(createPayload.ticketNumber);
        setFiles([]);
        setError(
          `Ticket ${createPayload.ticketNumber} was created, but ${uploadFailures.length} attachment${uploadFailures.length === 1 ? "" : "s"} failed to upload. Open the ticket detail page to finish adding evidence without creating a duplicate ticket.`
        );
        return;
      }

      startTransition(() => {
        router.push(`/tickets/${createPayload.ticketNumber}`);
        router.refresh();
      });
    } catch {
      setError("Unable to reach the server right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className={styles.shell}>
      <div className={styles.header}>
        <div>
          <p className={styles.kicker}>{copy.formKicker}</p>
          <h2>{copy.formTitle}</h2>
          <p className={styles.copy}>{copy.formCopy}</p>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.grid}>
          <label className={styles.field}>
            <span>{copy.fields.title}</span>
            <input
              type="text"
              placeholder={copy.placeholders.title}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>{copy.fields.category}</span>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>{copy.fields.priority}</span>
            <select
              value={priority}
              onChange={(event) =>
                setPriority(
                  event.target.value as (typeof priorities)[number]["value"]
                )
              }
            >
              {priorities.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>{copy.fields.location}</span>
            <input
              type="text"
              placeholder={copy.placeholders.location}
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>{copy.fields.assetTag}</span>
            <input
              type="text"
              placeholder={copy.placeholders.assetTag}
              value={assetTag}
              onChange={(event) => setAssetTag(event.target.value)}
            />
          </label>

          <div className={styles.field}>
            <span>{copy.fields.attachments}</span>
            <div className={styles.fileActions}>
              <label className={styles.fileAction}>
                <PaperclipIcon className={styles.fileActionIcon} />
                <span>{copy.filePickerAction}</span>
                <input
                  className={styles.fileInput}
                  type="file"
                  accept=".png,.jpg,.jpeg,.heic,.heif,.pdf,image/png,image/jpeg,image/heic,image/heif,application/pdf"
                  multiple
                  onChange={handleFilesSelected}
                />
              </label>

              <label className={styles.mobileCaptureAction}>
                <CameraIcon className={styles.fileActionIcon} />
                <span>{copy.mobileCameraAction}</span>
                <input
                  className={styles.fileInput}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFilesSelected}
                />
              </label>
            </div>
            <small>{copy.attachmentHint}</small>
            <small className={styles.mobileCaptureHint}>
              {copy.mobileCameraHint}
            </small>
          </div>
        </div>

        <label className={styles.field}>
          <span>{copy.fields.description}</span>
          <textarea
            placeholder={copy.placeholders.description}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={8}
          />
        </label>

        {files.length > 0 ? (
          <div className={styles.fileList}>
            {files.map((file) => (
              <span key={`${file.name}-${file.lastModified}`}>{file.name}</span>
            ))}
          </div>
        ) : null}

        {error ? <p className={styles.errorMessage}>{error}</p> : null}

        {createdTicketNumber ? (
          <div className={styles.recoveryCard}>
            <p className={styles.recoveryLabel}>{copy.createdLabel}</p>
            <p className={styles.recoveryCopy}>{copy.createdCopy}</p>
            <div className={styles.recoveryActions}>
              <Link
                href={`/tickets/${createdTicketNumber}`}
                className={styles.recoveryLink}
              >
                Open {createdTicketNumber}
              </Link>
            </div>
          </div>
        ) : null}

        <div className={styles.actions}>
          <button type="submit" disabled={disabled}>
            {isSubmitting ? copy.creating : copy.create}
          </button>
        </div>
      </form>
    </section>
  );
}
