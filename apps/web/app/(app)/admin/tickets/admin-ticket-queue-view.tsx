"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import styles from "./admin-ticket-queue-view.module.css";

export type AdminTicketStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "pending_user"
  | "resolved"
  | "closed";

export type AdminTicketPriority = "low" | "medium" | "high" | "urgent";

export interface AdminTicket {
  id: string;
  href: string;
  title: string;
  requesterName: string;
  department?: string | null;
  priority: AdminTicketPriority;
  status: AdminTicketStatus;
  ageLabel: string;
  updatedLabel: string;
  assignee?: string | null;
  hasAttachments?: boolean;
  responseLabel?: string;
  summary?: string;
}

export interface AdminTicketQueueViewProps {
  tickets?: AdminTicket[];
  currentUserRole?: "admin" | "technician";
}

type QueueQuickFilter =
  | "all"
  | "urgent"
  | "needs_response"
  | "with_attachments";

const statusCopy: Record<AdminTicketStatus, string> = {
  open: "Open",
  assigned: "Assigned",
  in_progress: "In progress",
  pending_user: "Pending user",
  resolved: "Resolved",
  closed: "Closed"
};

const statusTone: Record<AdminTicketStatus, string> = {
  open: styles.statusOpen,
  assigned: styles.statusAssigned,
  in_progress: styles.statusActive,
  pending_user: styles.statusWaiting,
  resolved: styles.statusResolved,
  closed: styles.statusClosed
};

const priorityTone: Record<AdminTicketPriority, string> = {
  low: styles.priorityLow,
  medium: styles.priorityMedium,
  high: styles.priorityHigh,
  urgent: styles.priorityUrgent
};

const quickFilterCopy: Record<QueueQuickFilter, string> = {
  all: "All tickets",
  urgent: "Urgent first",
  needs_response: "Needs response",
  with_attachments: "Has attachments"
};

function countByStatus(tickets: AdminTicket[]) {
  return tickets.reduce<Record<AdminTicketStatus, number>>(
    (acc, ticket) => {
      acc[ticket.status] += 1;
      return acc;
    },
    {
      open: 0,
      assigned: 0,
      in_progress: 0,
      pending_user: 0,
      resolved: 0,
      closed: 0
    }
  );
}

function countUrgentTickets(tickets: AdminTicket[]) {
  return tickets.filter((ticket) => ticket.priority === "urgent").length;
}

function roleLabel(role: AdminTicketQueueViewProps["currentUserRole"]) {
  if (role === "technician") {
    return "Technician queue";
  }

  return "Admin queue";
}

function heroNote(role: AdminTicketQueueViewProps["currentUserRole"], total: number) {
  if (role === "technician") {
    return `${total} tickets are waiting on your team. Keep the SLA moving and clear the blockers first.`;
  }

  return `${total} tickets are active across the organization. Triage by urgency, aging, and whether the queue is blocked.`;
}

function actionLabel(role: AdminTicketQueueViewProps["currentUserRole"]) {
  return role === "technician" ? "Start next ticket" : "Assign from queue";
}

function normalize(value?: string | null) {
  return value?.toLowerCase().trim() ?? "";
}

function matchesSearch(ticket: AdminTicket, query: string) {
  if (!query) {
    return true;
  }

  const haystack = [
    ticket.id,
    ticket.title,
    ticket.requesterName,
    ticket.department,
    ticket.assignee,
    ticket.summary
  ]
    .map((value) => normalize(value))
    .join(" ");

  return haystack.includes(query);
}

export function AdminTicketQueueView({
  tickets = [],
  currentUserRole = "admin"
}: AdminTicketQueueViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminTicketStatus | "all">("all");
  const [quickFilter, setQuickFilter] = useState<QueueQuickFilter>("all");

  const normalizedQuery = normalize(searchQuery);
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (!matchesSearch(ticket, normalizedQuery)) {
        return false;
      }

      if (statusFilter !== "all" && ticket.status !== statusFilter) {
        return false;
      }

      if (quickFilter === "urgent" && ticket.priority !== "urgent") {
        return false;
      }

      if (
        quickFilter === "needs_response" &&
        ticket.responseLabel !== "Awaiting first response"
      ) {
        return false;
      }

      if (quickFilter === "with_attachments" && !ticket.hasAttachments) {
        return false;
      }

      return true;
    });
  }, [normalizedQuery, quickFilter, statusFilter, tickets]);

  const counts = countByStatus(tickets);
  const filteredCounts = countByStatus(filteredTickets);
  const openWork =
    counts.open + counts.assigned + counts.in_progress + counts.pending_user;
  const urgentTickets = countUrgentTickets(tickets);
  const filteredOpenWork =
    filteredCounts.open +
    filteredCounts.assigned +
    filteredCounts.in_progress +
    filteredCounts.pending_user;
  const nextTicket = filteredTickets[0] ?? tickets[0];
  const hasActiveFilters =
    Boolean(normalizedQuery) || statusFilter !== "all" || quickFilter !== "all";

  function resetFilters() {
    setSearchQuery("");
    setStatusFilter("all");
    setQuickFilter("all");
  }

  return (
    <section className={styles.shell}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.glowSecondary} aria-hidden="true" />

      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>{roleLabel(currentUserRole)}</p>
          <h2>Keep the queue moving without losing the paper trail.</h2>
          <p className={styles.description}>{heroNote(currentUserRole, tickets.length)}</p>

          <div className={styles.heroActions}>
            <Link href="/tickets" className={styles.secondaryAction}>
              Open requester view
            </Link>
            {nextTicket ? (
              <Link href={nextTicket.href} className={styles.primaryAction}>
                {actionLabel(currentUserRole)}
              </Link>
            ) : null}
          </div>
        </div>

        <aside className={styles.heroRail}>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Active work</span>
            <strong>{openWork}</strong>
            <p>Tickets currently being handled or waiting on a reply.</p>
          </div>
          <div className={styles.metricGrid}>
            <div>
              <span>Urgent</span>
              <strong>{urgentTickets}</strong>
            </div>
            <div>
              <span>In progress</span>
              <strong>{counts.in_progress}</strong>
            </div>
            <div>
              <span>Resolved</span>
              <strong>{counts.resolved}</strong>
            </div>
            <div>
              <span>Closed</span>
              <strong>{counts.closed}</strong>
            </div>
          </div>
        </aside>
      </header>

      <section className={styles.sectionHead}>
        <div>
          <p className={styles.sectionLabel}>Queue snapshot</p>
          <h3>Prioritize the cases that are aging, blocked, or escalating.</h3>
          <p className={styles.resultMeta}>
            Showing {filteredTickets.length} of {tickets.length} tickets.
            {hasActiveFilters
              ? ` ${filteredOpenWork} still count as active work in the current view.`
              : ` ${openWork} are still active across the full queue.`}
          </p>
        </div>

        <div className={styles.controlPanel}>
          <label className={styles.searchField}>
            <span>Search queue</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Ticket, requester, department, assignee..."
            />
          </label>

          <label className={styles.selectField}>
            <span>Status</span>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as AdminTicketStatus | "all")
              }
            >
              <option value="all">All statuses</option>
              {Object.entries(statusCopy).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.filters} role="list" aria-label="Queue filters">
            {(Object.keys(quickFilterCopy) as QueueQuickFilter[]).map((filter) => {
              const active = quickFilter === filter;

              return (
                <button
                  key={filter}
                  type="button"
                  className={active ? styles.filterActive : styles.filterChip}
                  onClick={() => setQuickFilter(filter)}
                >
                  {quickFilterCopy[filter]}
                </button>
              );
            })}
          </div>

          {hasActiveFilters ? (
            <button
              type="button"
              className={styles.resetButton}
              onClick={resetFilters}
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </section>

      {filteredTickets.length === 0 ? (
        <article className={styles.emptyState}>
          <p className={styles.emptyLabel}>
            {tickets.length === 0 ? "No tickets in the queue" : "No tickets match the current filters"}
          </p>
          <h3>
            {tickets.length === 0
              ? "Everything is clear for now."
              : "Try widening the queue filters."}
          </h3>
          <p>
            {tickets.length === 0
              ? "When a request comes in, it will show up here with priority, status, attachments, and the latest action on record."
              : "Search by requester, assignee, ticket number, or switch the quick filters to bring more of the queue back into view."}
          </p>
        </article>
      ) : (
        <div className={styles.queue}>
          {filteredTickets.map((ticket) => (
            <article key={ticket.id} className={styles.ticketCard}>
              <div className={styles.ticketTop}>
                <div>
                  <p className={styles.ticketId}>{ticket.id}</p>
                  <h4>{ticket.title}</h4>
                </div>

                <div className={styles.badgeStack}>
                  <span className={`${styles.statusBadge} ${statusTone[ticket.status]}`}>
                    {statusCopy[ticket.status]}
                  </span>
                  <span className={`${styles.priorityBadge} ${priorityTone[ticket.priority]}`}>
                    {ticket.priority}
                  </span>
                </div>
              </div>

              <div className={styles.ticketMeta}>
                <div>
                  <span>Requester</span>
                  <strong>{ticket.requesterName}</strong>
                </div>
                <div>
                  <span>Department</span>
                  <strong>{ticket.department ?? "Not provided"}</strong>
                </div>
                <div>
                  <span>Assignee</span>
                  <strong>{ticket.assignee ?? "Unassigned"}</strong>
                </div>
                <div>
                  <span>Age</span>
                  <strong>{ticket.ageLabel}</strong>
                </div>
              </div>

              {ticket.summary ? <p className={styles.summary}>{ticket.summary}</p> : null}

              <div className={styles.ticketFooter}>
                <div className={styles.footerNotes}>
                  <span>{ticket.updatedLabel}</span>
                  {ticket.responseLabel ? <span>{ticket.responseLabel}</span> : null}
                  {ticket.hasAttachments ? <span>Attachment included</span> : null}
                </div>

                <div className={styles.footerActions}>
                  <Link href={ticket.href} className={styles.ghostAction}>
                    Review
                  </Link>
                  <Link href={ticket.href} className={styles.primaryMiniAction}>
                    Update status
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
