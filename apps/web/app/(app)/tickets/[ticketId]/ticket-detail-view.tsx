import Link from "next/link";

import { toBackendAssetUrl } from "@/lib/backend";
import type { TicketAttachmentItem, TicketCommentItem, TicketDetail, TicketStatusHistoryItem } from "@/lib/tickets";

import { TicketStaffActions } from "./ticket-staff-actions";
import { TicketAttachmentForm } from "./ticket-attachment-form";
import styles from "./ticket-detail-view.module.css";

interface TicketDetailViewProps {
  ticket: TicketDetail;
  currentUserRole?: "requester" | "technician" | "admin";
  assignableUsers?: ReadonlyArray<{
    id: string;
    fullName: string;
    email: string;
    role: string;
  }>;
  backHref?: string;
  backLabel?: string;
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
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

function renderComment(comment: TicketCommentItem) {
  return (
    <article key={comment.id} className={styles.timelineCard}>
      <div className={styles.timelineHeader}>
        <div>
          <p>{comment.author.fullName}</p>
          <span>{comment.author.role.toLowerCase()}</span>
        </div>
        <time>{formatDateTime(comment.createdAt)}</time>
      </div>
      <p className={styles.timelineType}>{formatStatus(comment.type)}</p>
      <p className={styles.timelineBody}>{comment.body}</p>
    </article>
  );
}

function renderHistoryEntry(entry: TicketStatusHistoryItem) {
  return (
    <article key={entry.id} className={styles.timelineCard}>
      <div className={styles.timelineHeader}>
        <div>
          <p>{formatStatus(entry.toStatus)}</p>
          <span>{entry.changedBy.fullName}</span>
        </div>
        <time>{formatDateTime(entry.createdAt)}</time>
      </div>
      <p className={styles.timelineBody}>
        {entry.fromStatus
          ? `Moved from ${formatStatus(entry.fromStatus)} to ${formatStatus(entry.toStatus)}.`
          : `Moved to ${formatStatus(entry.toStatus)}.`}
      </p>
      {entry.note ? <p className={styles.historyNote}>{entry.note}</p> : null}
    </article>
  );
}

function renderAttachment(attachment: TicketAttachmentItem) {
  return (
    <article key={attachment.id} className={styles.attachmentCard}>
      <div>
        <p>{attachment.fileName}</p>
        <span>
          {formatFileSize(attachment.fileSize)} · Uploaded by{" "}
          {attachment.uploadedBy.fullName}
        </span>
      </div>
      <a
        href={toBackendAssetUrl(attachment.fileUrl)}
        target="_blank"
        rel="noreferrer"
      >
        Open file
      </a>
    </article>
  );
}

export function TicketDetailView({
  ticket,
  currentUserRole,
  assignableUsers,
  backHref = "/tickets",
  backLabel = "Back to my tickets"
}: TicketDetailViewProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.hero}>
        <div className={styles.heroTop}>
          <Link href={backHref} className={styles.backLink}>
            {backLabel}
          </Link>
          <p className={styles.ticketNumber}>{ticket.ticketNumber}</p>
        </div>

        <div className={styles.heroCopy}>
          <p className={styles.kicker}>Ticket detail</p>
          <h1>{ticket.title}</h1>
          <p className={styles.heroDescription}>
            Keep the issue, supporting evidence, and the conversation in one
            place so the next action is obvious on both desktop and mobile.
          </p>
        </div>

        <div className={styles.heroMeta}>
          <span className={styles.badge}>{formatStatus(ticket.status)}</span>
          <span className={styles.badge}>{formatStatus(ticket.priority)}</span>
        </div>

        <dl className={styles.heroFacts}>
          <div>
            <dt>Requester</dt>
            <dd>{ticket.requester.fullName}</dd>
          </div>
          <div>
            <dt>Assigned</dt>
            <dd>{ticket.assignedTo?.fullName ?? "Unassigned"}</dd>
          </div>
          <div>
            <dt>Category</dt>
            <dd>{ticket.category.name}</dd>
          </div>
          <div>
            <dt>Updated</dt>
            <dd>{formatDateTime(ticket.updatedAt)}</dd>
          </div>
        </dl>
      </header>

      <div className={styles.mobilePriority}>
        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionLabel}>Issue summary</p>
              <h2>What is happening</h2>
            </div>
          </div>

          <p className={styles.body}>{ticket.description}</p>

          {ticket.resolutionSummary ? (
            <div className={styles.callout}>
              <p className={styles.sectionLabel}>Resolution summary</p>
              <p>{ticket.resolutionSummary}</p>
            </div>
          ) : null}
        </section>

        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionLabel}>Request context</p>
              <h2>Key details</h2>
            </div>
          </div>

          <dl className={styles.metaList}>
            <div>
              <dt>Requester</dt>
              <dd>{ticket.requester.fullName}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{ticket.category.name}</dd>
            </div>
            <div>
              <dt>Priority</dt>
              <dd>{formatStatus(ticket.priority)}</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{formatDateTime(ticket.createdAt)}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{formatDateTime(ticket.updatedAt)}</dd>
            </div>
            <div>
              <dt>Assigned to</dt>
              <dd>{ticket.assignedTo?.fullName ?? "Not assigned"}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{ticket.location ?? "Not provided"}</dd>
            </div>
            <div>
              <dt>Asset tag</dt>
              <dd>{ticket.assetTag ?? "Not provided"}</dd>
            </div>
          </dl>
        </section>
      </div>

      <div className={styles.staffActionsWrap}>
        <TicketStaffActions
          ticket={ticket}
          currentUserRole={currentUserRole}
          assignableUsers={assignableUsers}
        />
      </div>

      <section className={styles.panel}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionLabel}>Evidence</p>
            <h2>Attachments</h2>
          </div>
        </div>

        {ticket.attachments.length > 0 ? (
          <div className={styles.attachmentList}>
            {ticket.attachments.map(renderAttachment)}
          </div>
        ) : (
          <p className={styles.emptyState}>
            No attachments have been added to this ticket yet.
          </p>
        )}

        <TicketAttachmentForm ticketIdentifier={ticket.ticketNumber} />
      </section>

      <div className={styles.timelineGrid}>
        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionLabel}>Conversation</p>
              <h2>Comments</h2>
            </div>
          </div>

          {ticket.comments.length > 0 ? (
            <div className={styles.timelineList}>
              {ticket.comments.map(renderComment)}
            </div>
          ) : (
            <p className={styles.emptyState}>
              No public comments yet. Add one below if you need to give the IT
              team more context.
            </p>
          )}
        </section>

        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionLabel}>Audit trail</p>
              <h2>Status history</h2>
            </div>
          </div>

          {ticket.statusHistory.length > 0 ? (
            <div className={styles.timelineList}>
              {ticket.statusHistory.map(renderHistoryEntry)}
            </div>
          ) : (
            <p className={styles.emptyState}>
              No status transitions have been recorded yet.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
