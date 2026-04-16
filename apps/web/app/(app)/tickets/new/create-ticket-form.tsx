"use client";

import Link from "next/link";
import { startTransition, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import type { CategoryOption } from "@/lib/categories";

import styles from "./create-ticket-form.module.css";

const priorities = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" }
] as const;

interface CreateTicketFormProps {
  categories: CategoryOption[];
}

interface CreatedTicketPayload {
  id: string;
  ticketNumber: string;
}

export function CreateTicketForm({ categories }: CreateTicketFormProps) {
  const router = useRouter();
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
    setFiles(Array.from(event.target.files ?? []));
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
          <p className={styles.kicker}>Create ticket</p>
          <h2>Capture the issue with enough context to act quickly.</h2>
          <p className={styles.copy}>
            Keep the request clear, assign the right category, and attach photos
            or screenshots if they help the IT team reproduce the problem.
          </p>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.grid}>
          <label className={styles.field}>
            <span>Title</span>
            <input
              type="text"
              placeholder="Printer in finance is offline"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Category</span>
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
            <span>Priority</span>
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
            <span>Location</span>
            <input
              type="text"
              placeholder="HR office, second floor"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Asset tag</span>
            <input
              type="text"
              placeholder="PC-1042"
              value={assetTag}
              onChange={(event) => setAssetTag(event.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Attachments</span>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.heic,.heif,.pdf,image/png,image/jpeg,image/heic,image/heif,application/pdf"
              multiple
              onChange={handleFilesSelected}
            />
            <small>
              Optional. Add screenshots, photos, or PDFs up to 10 MB each.
            </small>
          </label>
        </div>

        <label className={styles.field}>
          <span>Description</span>
          <textarea
            placeholder="Describe what is happening, what you tried, and when it started."
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
            <p className={styles.recoveryLabel}>Ticket created</p>
            <p className={styles.recoveryCopy}>
              The request is already in the system. Continue from the detail
              page instead of submitting the form again.
            </p>
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
            {isSubmitting ? "Creating ticket..." : "Create ticket"}
          </button>
        </div>
      </form>
    </section>
  );
}
