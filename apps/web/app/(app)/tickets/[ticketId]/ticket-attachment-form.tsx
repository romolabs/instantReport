"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import type { AppDictionary, Locale } from "@/lib/i18n";

import styles from "./ticket-attachment-form.module.css";

interface TicketAttachmentFormProps {
  locale: Locale;
  copy: AppDictionary["tickets"]["attachmentForm"];
  ticketIdentifier: string;
  title?: string;
  description?: string;
}

function formatFileSize(value: number) {
  if (value < 1024) {
    return `${value} B`;
  }

  const units = ["KB", "MB", "GB"];
  let size = value / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

export function TicketAttachmentForm({
  copy,
  ticketIdentifier,
  title = copy.title,
  description = copy.description
}: TicketAttachmentFormProps) {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const totalSize = useMemo(
    () => files.reduce((sum, file) => sum + file.size, 0),
    [files]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || files.length === 0) {
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
          `/api/tickets/${encodeURIComponent(ticketIdentifier)}/attachments`,
          {
            method: "POST",
            body: formData
          }
        );

        const payload = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;

        if (!response.ok) {
          throw new Error(
            payload?.message ??
              copy.error.singleFile.replace("{file}", file.name)
          );
        }
      }

      setFiles([]);
      setSuccess(copy.success);
      router.refresh();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : copy.error.upload
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className={styles.surface}>
      <div className={styles.header}>
        <div>
          <p className={styles.kicker}>{copy.kicker}</p>
          <h3>{title}</h3>
          <p className={styles.description}>{description}</p>
        </div>

        <div className={styles.fileHint}>
          <span>{copy.accepted}</span>
          <strong>{copy.acceptedValue}</strong>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.dropzone}>
          <span className={styles.dropzoneTitle}>{copy.chooseFiles}</span>
          <span className={styles.dropzoneBody}>{copy.chooseFilesHint}</span>
          <input
            type="file"
            multiple
            accept="image/*,application/pdf"
            onChange={(event) => {
              const nextFiles = Array.from(event.target.files ?? []);
              setFiles(nextFiles);
              setError(null);
              setSuccess(null);
            }}
          />
        </label>

        {files.length > 0 ? (
          <div className={styles.preview}>
            <div className={styles.previewHeader}>
              <p>{copy.selectedFiles}</p>
              <span>
                {files.length} file{files.length === 1 ? "" : "s"} ·{" "}
                {formatFileSize(totalSize)}
              </span>
            </div>

            <ul className={styles.fileList}>
              {files.map((file) => (
                <li key={`${file.name}-${file.size}-${file.lastModified}`}>
                  <div>
                    <strong>{file.name}</strong>
                    <span>{formatFileSize(file.size)}</span>
                  </div>
                  <span>{file.type || copy.unknownType}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {error ? <p className={styles.error}>{error}</p> : null}
        {success ? <p className={styles.success}>{success}</p> : null}

        <div className={styles.actions}>
          <p className={styles.helper}>{copy.helper}</p>

          <button
            type="submit"
            disabled={isSubmitting || files.length === 0}
            className={styles.button}
          >
            {isSubmitting ? copy.uploading : copy.upload}
          </button>
        </div>
      </form>
    </section>
  );
}
