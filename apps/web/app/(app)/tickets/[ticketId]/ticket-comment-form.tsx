"use client";

import { startTransition, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import styles from "./ticket-comment-form.module.css";

type CommentType = "PUBLIC" | "INTERNAL_NOTE" | "RESOLUTION_NOTE";

interface TicketCommentFormProps {
  ticketIdentifier: string;
  currentUserRole?: "requester" | "technician" | "admin";
}

const noteTypeLabels: Record<CommentType, string> = {
  PUBLIC: "Public comment",
  INTERNAL_NOTE: "Internal note",
  RESOLUTION_NOTE: "Resolution note"
};

function isStaffRole(role?: TicketCommentFormProps["currentUserRole"]) {
  return role === "technician" || role === "admin";
}

export function TicketCommentForm({
  ticketIdentifier,
  currentUserRole = "requester"
}: TicketCommentFormProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [commentType, setCommentType] = useState<CommentType>("PUBLIC");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const staffUser = isStaffRole(currentUserRole);

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
        setError(payload?.message ?? "Unable to add your comment.");
        return;
      }

      setBody("");
      setCommentType("PUBLIC");
      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError("Unable to reach the server right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <div>
          <p className={styles.kicker}>Add context</p>
          <h2>{staffUser ? "Add a ticket note" : "Leave a public comment"}</h2>
        </div>
      </div>

      {staffUser ? (
        <label className={styles.field}>
          <span>Note visibility</span>
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
            Internal notes stay hidden from requesters. Resolution notes stay visible in the ticket history.
          </small>
        </label>
      ) : null}

      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={
          staffUser
            ? "Capture troubleshooting details, a user-facing update, or the final resolution context."
            : "Share new information, confirm a test, or answer the IT team's question."
        }
        rows={5}
      />

      {error ? <p className={styles.errorMessage}>{error}</p> : null}

      <div className={styles.actions}>
        <button type="submit" disabled={isSubmitting || !body.trim()}>
          {isSubmitting
            ? "Posting note..."
            : staffUser
              ? `Post ${noteTypeLabels[commentType].toLowerCase()}`
              : "Post comment"}
        </button>
      </div>
    </form>
  );
}
