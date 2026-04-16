import Link from "next/link";

import { toBackendAssetUrl } from "@/lib/backend";
import {
  formatDateTime,
  interpolate,
  translateRole,
  translateStatus,
  type AppDictionary,
  type Locale
} from "@/lib/i18n";
import type { TicketAttachmentItem, TicketCommentItem, TicketDetail, TicketStatusHistoryItem } from "@/lib/tickets";

import { TicketStaffActions } from "./ticket-staff-actions";
import { TicketAttachmentForm } from "./ticket-attachment-form";
import styles from "./ticket-detail-view.module.css";

interface TicketDetailViewProps {
  locale: Locale;
  detailCopy: AppDictionary["tickets"]["detail"];
  attachmentCopy: AppDictionary["tickets"]["attachmentForm"];
  staffActionsCopy: AppDictionary["tickets"]["staffActions"];
  commonCopy: AppDictionary["common"];
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

function renderComment(
  comment: TicketCommentItem,
  locale: Locale
) {
  return (
    <article key={comment.id} className={styles.timelineCard}>
      <div className={styles.timelineHeader}>
        <div>
          <p>{comment.author.fullName}</p>
          <span>{translateRole(locale, comment.author.role)}</span>
        </div>
        <time>{formatDateTime(locale, comment.createdAt)}</time>
      </div>
      <p className={styles.timelineType}>{translateStatus(locale, comment.type)}</p>
      <p className={styles.timelineBody}>{comment.body}</p>
    </article>
  );
}

function renderHistoryEntry(
  entry: TicketStatusHistoryItem,
  locale: Locale,
  copy: AppDictionary["tickets"]["detail"]
) {
  return (
    <article key={entry.id} className={styles.timelineCard}>
      <div className={styles.timelineHeader}>
        <div>
          <p>{translateStatus(locale, entry.toStatus)}</p>
          <span>{entry.changedBy.fullName}</span>
        </div>
        <time>{formatDateTime(locale, entry.createdAt)}</time>
      </div>
      <p className={styles.timelineBody}>
        {entry.fromStatus
          ? interpolate(copy.movedFromTo, {
              from: translateStatus(locale, entry.fromStatus),
              to: translateStatus(locale, entry.toStatus)
            })
          : interpolate(copy.movedTo, {
              to: translateStatus(locale, entry.toStatus)
            })}
      </p>
      {entry.note ? <p className={styles.historyNote}>{entry.note}</p> : null}
    </article>
  );
}

function renderAttachment(
  attachment: TicketAttachmentItem,
  commonCopy: AppDictionary["common"],
  detailCopy: AppDictionary["tickets"]["detail"]
) {
  return (
    <article key={attachment.id} className={styles.attachmentCard}>
      <div>
        <p>{attachment.fileName}</p>
        <span>
          {formatFileSize(attachment.fileSize)} · {detailCopy.uploadedBy}{" "}
          {attachment.uploadedBy.fullName}
        </span>
      </div>
      <a
        href={toBackendAssetUrl(attachment.fileUrl)}
        target="_blank"
        rel="noreferrer"
      >
        {commonCopy.openFile}
      </a>
    </article>
  );
}

export function TicketDetailView({
  locale,
  detailCopy,
  attachmentCopy,
  staffActionsCopy,
  commonCopy,
  ticket,
  currentUserRole,
  assignableUsers,
  backHref = "/tickets",
  backLabel = "Back to my tickets"
}: TicketDetailViewProps) {
  const copy = detailCopy;

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
          <p className={styles.kicker}>{copy.kicker}</p>
          <h1>{ticket.title}</h1>
        </div>

        <dl className={styles.summaryStrip}>
          <div>
            <dt>{copy.facts.assigned}</dt>
            <dd>{ticket.assignedTo?.fullName ?? commonCopy.notAssigned}</dd>
          </div>
          <div>
            <dt>{copy.fields.priority}</dt>
            <dd>{translateStatus(locale, ticket.priority)}</dd>
          </div>
          <div>
            <dt>{copy.facts.updated}</dt>
            <dd>{formatDateTime(locale, ticket.updatedAt)}</dd>
          </div>
          <div>
            <dt>{copy.facts.status}</dt>
            <dd>{translateStatus(locale, ticket.status)}</dd>
          </div>
        </dl>
      </header>

      <div className={styles.staffActionsWrap}>
        <TicketStaffActions
          locale={locale}
          copy={staffActionsCopy}
          ticket={ticket}
          currentUserRole={currentUserRole}
          assignableUsers={assignableUsers}
        />
      </div>

      <div className={styles.mobilePriority}>
        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionLabel}>{copy.summaryLabel}</p>
              <h2>{copy.summaryTitle}</h2>
            </div>
          </div>

          <p className={styles.body}>{ticket.description}</p>

          {ticket.resolutionSummary ? (
            <div className={styles.callout}>
              <p className={styles.sectionLabel}>{copy.resolutionSummary}</p>
              <p>{ticket.resolutionSummary}</p>
            </div>
          ) : null}
        </section>

        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionLabel}>{copy.contextLabel}</p>
              <h2>{copy.contextTitle}</h2>
            </div>
          </div>

          <dl className={styles.metaList}>
            <div>
              <dt>{copy.facts.requester}</dt>
              <dd>{ticket.requester.fullName}</dd>
            </div>
            <div>
              <dt>{copy.facts.category}</dt>
              <dd>{ticket.category.name}</dd>
            </div>
            <div>
              <dt>{copy.fields.created}</dt>
              <dd>{formatDateTime(locale, ticket.createdAt)}</dd>
            </div>
            <div>
              <dt>{copy.fields.location}</dt>
              <dd>{ticket.location ?? commonCopy.notProvided}</dd>
            </div>
            <div>
              <dt>{copy.fields.assetTag}</dt>
              <dd>{ticket.assetTag ?? commonCopy.notProvided}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className={styles.panel}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionLabel}>{copy.evidenceLabel}</p>
            <h2>{copy.evidenceTitle}</h2>
          </div>
        </div>

        {ticket.attachments.length > 0 ? (
          <div className={styles.attachmentList}>
            {ticket.attachments.map((attachment) =>
              renderAttachment(attachment, commonCopy, copy)
            )}
          </div>
        ) : (
          <p className={styles.emptyState}>{copy.noAttachments}</p>
        )}

        <TicketAttachmentForm
          locale={locale}
          copy={attachmentCopy}
          ticketIdentifier={ticket.ticketNumber}
        />
      </section>

      <div className={styles.timelineGrid}>
        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionLabel}>{copy.conversationLabel}</p>
              <h2>{copy.commentsTitle}</h2>
            </div>
          </div>

          {ticket.comments.length > 0 ? (
            <div className={styles.timelineList}>
              {ticket.comments.map((comment) => renderComment(comment, locale))}
            </div>
          ) : (
            <p className={styles.emptyState}>{copy.noComments}</p>
          )}
        </section>

        <section className={styles.panel}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionLabel}>{copy.historyLabel}</p>
              <h2>{copy.historyTitle}</h2>
            </div>
          </div>

          {ticket.statusHistory.length > 0 ? (
            <div className={styles.timelineList}>
              {ticket.statusHistory.map((entry) =>
                renderHistoryEntry(entry, locale, copy)
              )}
            </div>
          ) : (
            <p className={styles.emptyState}>{copy.noHistory}</p>
          )}
        </section>
      </div>
    </div>
  );
}
