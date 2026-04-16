"use client";

import { startTransition, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import type { AppDictionary, Locale } from "@/lib/i18n";
import { translateStatus } from "@/lib/i18n";

import styles from "./ticket-comment-form.module.css";

type CommentType = "PUBLIC" | "INTERNAL_NOTE" | "RESOLUTION_NOTE";

interface TicketCommentFormProps {
  ticketIdentifier: string;
  locale: Locale;
  copy: AppDictionary["tickets"]["commentForm"];
  currentUserRole?: "requester" | "technician" | "admin";
}

function isStaffRole(role?: TicketCommentFormProps["currentUserRole"]) {
  return role === "technician" || role === "admin";
}

export function TicketCommentForm({
  locale,
  copy,
  ticketIdentifier,
  currentUserRole = "requester"
}: TicketCommentFormProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [commentType, setCommentType] = useState<CommentType>("PUBLIC");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const staffUser = isStaffRole(currentUserRole);
  const noteTypeLabels: Record<CommentType, string> = {
    PUBLIC: translateStatus(locale, "PUBLIC"),
    INTERNAL_NOTE: translateStatus(locale, "INTERNAL_NOTE"),
    RESOLUTION_NOTE: translateStatus(locale, "RESOLUTION_NOTE")
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting || !body.trim()) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/tickets/${encodeURIComponent(ticketIdentifier)}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            body,
            type: staffUser ? commentType : "PUBLIC"
          })
        }
      );

      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setError(payload?.message ?? copy.error);
        return;
      }

      setBody("");
      setCommentType("PUBLIC");
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError(copy.reachServer);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <div>
          <p className={styles.kicker}>{copy.kicker}</p>
          <h2>{staffUser ? copy.titleStaff : copy.titleRequester}</h2>
        </div>
      </div>

      {staffUser ? (
        <label className={styles.field}>
          <span>{copy.noteVisibility}</span>
          <select
            value={commentType}
            onChange={(event) => setCommentType(event.target.value as CommentType)}
          >
            {Object.entries(noteTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <small className={styles.helperText}>
            {copy.noteVisibilityHelp}
          </small>
        </label>
      ) : null}

      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={
          staffUser
            ? copy.placeholders.staff
            : copy.placeholders.requester
        }
        rows={5}
      />

      {error ? <p className={styles.errorMessage}>{error}</p> : null}

      <div className={styles.actions}>
        <button type="submit" disabled={isSubmitting || !body.trim()}>
          {isSubmitting
            ? copy.postingComment
            : staffUser
              ? `Post ${noteTypeLabels[commentType].toLowerCase()}`
              : copy.submitComment}
        </button>
      </div>
    </form>
  );
}
