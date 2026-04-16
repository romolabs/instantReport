"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";

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

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatRole(role?: string) {
  if (!role) {
    return "Staff";
  }

  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
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
        setAssignError(payload?.message ?? "Unable to assign the ticket.");
        return;
      }

      setAssignmentNote("");
      router.refresh();
    } catch {
      setAssignError("Unable to reach the server right now.");
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
        setStatusError(payload?.message ?? "Unable to update workflow status.");
        return;
      }

      setStatusNote("");
      setStatusReopenReason("");
      router.refresh();
    } catch {
      setStatusError("Unable to reach the server right now.");
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
        setCloseoutError(payload?.message ?? "Unable to save the close-out details.");
        return;
      }

      setResolutionNote("");
      setResolutionReopenReason("");
      router.refresh();
    } catch {
      setCloseoutError("Unable to reach the server right now.");
    } finally {
      setResolutionBusy(false);
    }
  }

  return (
    <section className={styles.surface}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Staff console</p>
          <h2>Technician and admin actions</h2>
          <p className={styles.intro}>
            Keep assignment, status changes, and closeout notes close to the
            ticket so the audit trail stays clean.
          </p>
        </div>

        <div className={styles.roleBadge}>
          <span>{formatRole(currentUserRole)} access</span>
          <strong>{formatStatus(ticket.status)}</strong>
        </div>
      </header>

      <dl className={styles.miniStats}>
        <div>
          <dt>Owner</dt>
          <dd>{ticket.assignedTo?.fullName ?? "Unassigned"}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{formatDateTime(ticket.updatedAt)}</dd>
        </div>
        <div>
          <dt>Comments</dt>
          <dd>{ticket._count.comments}</dd>
        </div>
        <div>
          <dt>Evidence</dt>
          <dd>{ticket._count.attachments}</dd>
        </div>
      </dl>

      <div className={styles.grid}>
        <FieldShell
          eyebrow="Assignment"
          title="Route the ticket"
          description="Pick the current owner and capture a short handoff note."
        >
          <form className={styles.form} onSubmit={handleAssignmentSubmit}>
            <label className={styles.field}>
              <span>Assign to</span>
              <select
                value={assigneeId}
                onChange={(event) => setAssigneeId(event.target.value)}
                disabled={assignableUsers.length === 0}
              >
                <option value="">
                  {assignableUsers.length === 0
                    ? "No assignable users supplied"
                    : "Choose a technician or admin"}
                </option>
                {assignableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} - {formatRole(user.role)}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>Handoff note</span>
              <textarea
                value={assignmentNote}
                onChange={(event) => setAssignmentNote(event.target.value)}
                placeholder="Optional context for the next technician."
                rows={4}
              />
            </label>

            {assignError ? <p className={styles.errorText}>{assignError}</p> : null}

            <div className={styles.formFooter}>
              <p className={styles.helperText}>
                {ticket.status === "RESOLVED" || ticket.status === "CLOSED"
                  ? "Resolved and closed tickets must be reopened before they can be reassigned."
                  : "Assignment moves ownership without losing the existing history."}
              </p>
              <button
                type="submit"
                disabled={assignmentBusy || !canAssign}
                className={styles.primaryButton}
              >
                {assignmentBusy ? "Saving assignment..." : "Save assignment"}
              </button>
            </div>
          </form>
        </FieldShell>

        <FieldShell
          eyebrow="Lifecycle"
          title="Advance the status"
          description="Move the ticket through active work, waiting states, or a clean reopen."
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
                    {formatStatus(option)}
                  </button>
                );
              })}
            </div>

            <label className={styles.field}>
              <span>Status note</span>
              <textarea
                value={statusNote}
                onChange={(event) => setStatusNote(event.target.value)}
                placeholder="Capture why the status changed or what the next step is."
                rows={4}
              />
            </label>

            {isTerminal ? (
              <label className={styles.field}>
                <span>Reopen reason</span>
                <textarea
                  value={statusReopenReason}
                  onChange={(event) => setStatusReopenReason(event.target.value)}
                  placeholder="Required if this resolved or closed ticket is moving back into active work."
                  rows={3}
                />
              </label>
            ) : null}

            {statusError ? <p className={styles.errorText}>{statusError}</p> : null}

            <div className={styles.formFooter}>
              <p className={styles.helperText}>
                The selected state is {formatStatus(statusDraft)}.
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
                {statusBusy ? "Saving status..." : "Save status"}
              </button>
            </div>
          </form>
        </FieldShell>

        <FieldShell
          eyebrow="Close-out"
          title="Write the resolution"
          description="Capture the final fix before marking the ticket resolved or closed."
        >
          <form className={styles.form} onSubmit={handleResolutionSubmit}>
            <div className={styles.compactGrid}>
              <label className={styles.field}>
                <span>Close-out target</span>
                <select
                  value={closeoutStatus}
                  onChange={(event) =>
                    setCloseoutStatus(event.target.value as TicketStatus)
                  }
                >
                  {closeoutOptions.map((option) => (
                    <option key={option} value={option}>
                      {formatStatus(option)}
                    </option>
                  ))}
                </select>
              </label>

              <div className={styles.helperTile}>
                <span>Current state</span>
                <strong>{formatStatus(ticket.status)}</strong>
              </div>
            </div>

            <label className={styles.field}>
              <span>Resolution summary</span>
              <textarea
                value={resolutionSummary}
                onChange={(event) => setResolutionSummary(event.target.value)}
                placeholder="Summarize the fix in language the requester can understand."
                rows={4}
              />
            </label>

            <label className={styles.field}>
              <span>Close-out note</span>
              <textarea
                value={resolutionNote}
                onChange={(event) => setResolutionNote(event.target.value)}
                placeholder="Optional internal context for the audit trail."
                rows={3}
              />
            </label>

            {isReopeningClosedTicket ? (
              <label className={styles.field}>
                <span>Reopen reason</span>
                <textarea
                  value={resolutionReopenReason}
                  onChange={(event) => setResolutionReopenReason(event.target.value)}
                  placeholder="Required when reopening a closed ticket into resolved work."
                  rows={3}
                />
              </label>
            ) : null}

            {closeoutError ? <p className={styles.errorText}>{closeoutError}</p> : null}

            <div className={styles.formFooter}>
              <p className={styles.helperText}>
                Closing requires a resolution summary; reopening a closed ticket
                requires a reopen reason.
              </p>
              <button
                type="submit"
                disabled={resolutionBusy || !canSaveCloseout}
                className={styles.primaryButton}
              >
                {resolutionBusy ? "Saving close-out..." : "Save close-out"}
              </button>
            </div>
          </form>
        </FieldShell>
      </div>
    </section>
  );
}
