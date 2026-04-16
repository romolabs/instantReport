"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";

import type { AppDictionary, Locale } from "@/lib/i18n";
import {
  formatDateTime,
  interpolate,
  translateRole,
  translateStatus
} from "@/lib/i18n";
import type { TicketDetail } from "@/lib/tickets";

import styles from "./ticket-staff-actions.module.css";

type StaffRole = "requester" | "technician" | "admin";
type TicketStatus = TicketDetail["status"];

interface AssignableUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface TicketStaffActionsProps {
  locale: Locale;
  copy: AppDictionary["tickets"]["staffActions"];
  ticket: TicketDetail;
  currentUserRole?: StaffRole;
  assignableUsers?: ReadonlyArray<AssignableUser>;
}

const workflowOptions: readonly TicketStatus[] = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "PENDING_USER"
] as const;

const closeoutOptions: readonly TicketStatus[] = ["RESOLVED", "CLOSED"] as const;

function FieldShell({
  eyebrow,
  title,
  description,
  children
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}>) {
  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <p className={styles.kicker}>{eyebrow}</p>
          <h3>{title}</h3>
        </div>
        <p className={styles.cardDescription}>{description}</p>
      </div>
      {children}
    </section>
  );
}

export function TicketStaffActions({
  locale,
  copy,
  ticket,
  currentUserRole,
  assignableUsers = []
}: TicketStaffActionsProps) {
  const router = useRouter();
  const [assigneeId, setAssigneeId] = useState(ticket.assignedTo?.id ?? "");
  const [assignmentNote, setAssignmentNote] = useState("");
  const [statusDraft, setStatusDraft] = useState<TicketStatus>(
    workflowOptions.includes(ticket.status as TicketStatus)
      ? ticket.status
      : "IN_PROGRESS"
  );
  const [statusNote, setStatusNote] = useState("");
  const [statusReopenReason, setStatusReopenReason] = useState("");
  const [closeoutStatus, setCloseoutStatus] = useState<TicketStatus>(
    ticket.status === "CLOSED" ? "CLOSED" : "RESOLVED"
  );
  const [resolutionSummary, setResolutionSummary] = useState(
    ticket.resolutionSummary ?? ""
  );
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolutionReopenReason, setResolutionReopenReason] = useState("");
  const [assignError, setAssignError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [closeoutError, setCloseoutError] = useState<string | null>(null);
  const [assignmentBusy, setAssignmentBusy] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const [resolutionBusy, setResolutionBusy] = useState(false);

  const canAssign = useMemo(
    () =>
      Boolean(assigneeId) &&
      ticket.assignedTo?.id !== assigneeId &&
      ticket.status !== "RESOLVED" &&
      ticket.status !== "CLOSED",
    [assigneeId, ticket.assignedTo?.id, ticket.status]
  );
  const isTerminal = ticket.status === "RESOLVED" || ticket.status === "CLOSED";
  const isReopeningClosedTicket =
    ticket.status === "CLOSED" && closeoutStatus === "RESOLVED";
  const canUpdateWorkflow = statusDraft !== ticket.status;
  const canSaveCloseout =
    closeoutStatus !== ticket.status &&
    (closeoutStatus !== "CLOSED" || Boolean(resolutionSummary.trim())) &&
    (!isReopeningClosedTicket || Boolean(resolutionReopenReason.trim()));

  if (!currentUserRole || currentUserRole === "requester") {
    return null;
  }

  const assignmentEyebrow =
    currentUserRole === "admin"
      ? copy.assignment.eyebrowAdmin
      : copy.assignment.eyebrowTechnician;
  const assignmentTitle =
    currentUserRole === "admin"
      ? copy.assignment.titleAdmin
      : copy.assignment.titleTechnician;
  const assignmentDescription =
    currentUserRole === "admin"
      ? copy.assignment.descriptionAdmin
      : copy.assignment.descriptionTechnician;
  const assignmentSelectLabel =
    currentUserRole === "admin"
      ? copy.assignment.labelAdmin
      : copy.assignment.labelTechnician;
  const assignmentEmptyOption =
    assignableUsers.length === 0
      ? copy.assignment.emptyNone
      : currentUserRole === "admin"
        ? copy.assignment.emptyAdmin
        : copy.assignment.emptyTechnician;
  const assignmentHelperText =
    ticket.status === "RESOLVED" || ticket.status === "CLOSED"
      ? copy.assignment.helperClosed
      : currentUserRole === "admin"
        ? copy.assignment.helperAdmin
        : copy.assignment.helperTechnician;
  const assignmentButtonLabel =
    currentUserRole === "admin"
      ? copy.assignment.saveAdmin
      : copy.assignment.saveTechnician;

  async function handleAssignmentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canAssign || assignmentBusy) {
      return;
    }

    setAssignmentBusy(true);
    setAssignError(null);

    try {
      const response = await fetch(
        `/api/tickets/${encodeURIComponent(ticket.ticketNumber)}/assign`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            assignedToId: assigneeId,
            note: assignmentNote || undefined
          })
        }
      );

      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setAssignError(payload?.message ?? copy.assignment.assignError);
        return;
      }

      setAssignmentNote("");
      router.refresh();
    } catch {
      setAssignError(copy.assignment.serverError);
    } finally {
      setAssignmentBusy(false);
    }
  }

  async function handleStatusSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canUpdateWorkflow || statusBusy) {
      return;
    }

    setStatusBusy(true);
    setStatusError(null);

    try {
      const response = await fetch(
        `/api/tickets/${encodeURIComponent(ticket.ticketNumber)}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status: statusDraft,
            note: statusNote || undefined,
            reopenReason: isTerminal ? statusReopenReason || undefined : undefined
          })
        }
      );

      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setStatusError(payload?.message ?? copy.lifecycle.error);
        return;
      }

      setStatusNote("");
      setStatusReopenReason("");
      router.refresh();
    } catch {
      setStatusError(copy.lifecycle.serverError);
    } finally {
      setStatusBusy(false);
    }
  }

  async function handleResolutionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (resolutionBusy || !canSaveCloseout) {
      return;
    }

    setResolutionBusy(true);
    setCloseoutError(null);

    try {
      const response = await fetch(
        `/api/tickets/${encodeURIComponent(ticket.ticketNumber)}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status: closeoutStatus,
            note: resolutionNote || undefined,
            resolutionSummary: resolutionSummary || undefined,
            reopenReason: isReopeningClosedTicket
              ? resolutionReopenReason || undefined
              : undefined
          })
        }
      );

      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setCloseoutError(payload?.message ?? copy.closeout.error);
        return;
      }

      setResolutionNote("");
      setResolutionReopenReason("");
      router.refresh();
    } catch {
      setCloseoutError(copy.closeout.serverError);
    } finally {
      setResolutionBusy(false);
    }
  }

  return (
    <section className={styles.surface}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>{copy.headerKicker}</p>
          <h2>{copy.headerTitle}</h2>
          <p className={styles.intro}>{copy.headerCopy}</p>
        </div>

        <div className={styles.roleBadge}>
          <span>
            {interpolate(copy.access, {
              role: translateRole(locale, currentUserRole)
            })}
          </span>
          <strong>{translateStatus(locale, ticket.status)}</strong>
        </div>
      </header>

      <dl className={styles.miniStats}>
        <div>
          <dt>{copy.stats.owner}</dt>
          <dd>{ticket.assignedTo?.fullName ?? "—"}</dd>
        </div>
        <div>
          <dt>{copy.stats.updated}</dt>
          <dd>{formatDateTime(locale, ticket.updatedAt)}</dd>
        </div>
        <div>
          <dt>{copy.stats.comments}</dt>
          <dd>{ticket._count.comments}</dd>
        </div>
        <div>
          <dt>{copy.stats.evidence}</dt>
          <dd>{ticket._count.attachments}</dd>
        </div>
      </dl>

      <div className={styles.grid}>
        <FieldShell
          eyebrow={assignmentEyebrow}
          title={assignmentTitle}
          description={assignmentDescription}
        >
          <form className={styles.form} onSubmit={handleAssignmentSubmit}>
            <label className={styles.field}>
              <span>{assignmentSelectLabel}</span>
              <select
                value={assigneeId}
                onChange={(event) => setAssigneeId(event.target.value)}
                disabled={assignableUsers.length === 0}
              >
                <option value="">{assignmentEmptyOption}</option>
                {assignableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                    {user.fullName} - {translateRole(locale, user.role)}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>{copy.assignment.handoffNote}</span>
              <textarea
                value={assignmentNote}
                onChange={(event) => setAssignmentNote(event.target.value)}
                placeholder={copy.assignment.handoffPlaceholder}
                rows={4}
              />
            </label>

            {assignError ? <p className={styles.errorText}>{assignError}</p> : null}

            <div className={styles.formFooter}>
              <p className={styles.helperText}>{assignmentHelperText}</p>
              <button
                type="submit"
                disabled={assignmentBusy || !canAssign}
                className={styles.primaryButton}
              >
                {assignmentBusy ? copy.assignment.saving : assignmentButtonLabel}
              </button>
            </div>
          </form>
        </FieldShell>

        <FieldShell
          eyebrow={copy.lifecycle.eyebrow}
          title={copy.lifecycle.title}
          description={copy.lifecycle.description}
        >
          <form className={styles.form} onSubmit={handleStatusSubmit}>
            <div className={styles.statusChips} role="list" aria-label="Status options">
              {workflowOptions.map((option) => {
                const active = statusDraft === option;

                return (
                  <button
                    key={option}
                    type="button"
                    className={active ? styles.statusChipActive : styles.statusChip}
                    onClick={() => setStatusDraft(option)}
                  >
                    {translateStatus(locale, option)}
                  </button>
                );
              })}
            </div>

            <label className={styles.field}>
              <span>{copy.lifecycle.noteLabel}</span>
              <textarea
                value={statusNote}
                onChange={(event) => setStatusNote(event.target.value)}
                placeholder={copy.lifecycle.notePlaceholder}
                rows={4}
              />
            </label>

            {isTerminal ? (
              <label className={styles.field}>
                <span>{copy.lifecycle.reopenReason}</span>
                <textarea
                  value={statusReopenReason}
                  onChange={(event) => setStatusReopenReason(event.target.value)}
                  placeholder={copy.lifecycle.reopenPlaceholder}
                  rows={3}
                />
              </label>
            ) : null}

            {statusError ? <p className={styles.errorText}>{statusError}</p> : null}

            <div className={styles.formFooter}>
              <p className={styles.helperText}>
                {interpolate(copy.lifecycle.helper, {
                  status: translateStatus(locale, statusDraft)
                })}
              </p>
              <button
                type="submit"
                disabled={
                  statusBusy ||
                  !canUpdateWorkflow ||
                  (isTerminal && !statusReopenReason.trim())
                }
                className={styles.primaryButton}
              >
                {statusBusy ? copy.lifecycle.saving : copy.lifecycle.save}
              </button>
            </div>
          </form>
        </FieldShell>

        <FieldShell
          eyebrow={copy.closeout.eyebrow}
          title={copy.closeout.title}
          description={copy.closeout.description}
        >
          <form className={styles.form} onSubmit={handleResolutionSubmit}>
            <div className={styles.compactGrid}>
              <label className={styles.field}>
                <span>{copy.closeout.target}</span>
                <select
                  value={closeoutStatus}
                  onChange={(event) =>
                    setCloseoutStatus(event.target.value as TicketStatus)
                  }
                >
                  {closeoutOptions.map((option) => (
                    <option key={option} value={option}>
                      {translateStatus(locale, option)}
                    </option>
                  ))}
                </select>
              </label>

              <div className={styles.helperTile}>
                <span>{copy.closeout.currentState}</span>
                <strong>{translateStatus(locale, ticket.status)}</strong>
              </div>
            </div>

            <label className={styles.field}>
              <span>{copy.closeout.resolutionSummary}</span>
              <textarea
                value={resolutionSummary}
                onChange={(event) => setResolutionSummary(event.target.value)}
                placeholder={copy.closeout.resolutionPlaceholder}
                rows={4}
              />
            </label>

            <label className={styles.field}>
              <span>{copy.closeout.closeoutNote}</span>
              <textarea
                value={resolutionNote}
                onChange={(event) => setResolutionNote(event.target.value)}
                placeholder={copy.closeout.closeoutPlaceholder}
                rows={3}
              />
            </label>

            {isReopeningClosedTicket ? (
              <label className={styles.field}>
                <span>{copy.closeout.reopenReason}</span>
                <textarea
                  value={resolutionReopenReason}
                  onChange={(event) => setResolutionReopenReason(event.target.value)}
                  placeholder={copy.closeout.reopenPlaceholder}
                  rows={3}
                />
              </label>
            ) : null}

            {closeoutError ? <p className={styles.errorText}>{closeoutError}</p> : null}

            <div className={styles.formFooter}>
              <p className={styles.helperText}>{copy.closeout.helper}</p>
              <button
                type="submit"
                disabled={resolutionBusy || !canSaveCloseout}
                className={styles.primaryButton}
              >
                {resolutionBusy ? copy.closeout.saving : copy.closeout.save}
              </button>
            </div>
          </form>
        </FieldShell>
      </div>
    </section>
  );
}
