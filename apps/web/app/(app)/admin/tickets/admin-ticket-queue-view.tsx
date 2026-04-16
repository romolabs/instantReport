"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { getDictionary, interpolate, translateStatus, type Locale } from "@/lib/i18n";

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
  needsFirstResponse?: boolean;
}

export interface AdminTicketQueueViewProps {
  locale: Locale;
  tickets?: AdminTicket[];
  currentUserRole?: "admin" | "technician";
}

type QueueQuickFilter =
  | "all"
  | "urgent"
  | "needs_response"
  | "with_attachments";

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
  locale,
  tickets = [],
  currentUserRole = "admin"
}: AdminTicketQueueViewProps) {
  const copy = getDictionary(locale).admin.tickets;
  const commonCopy = getDictionary(locale).common;
  const statusCopy: Record<AdminTicketStatus, string> = {
    open: translateStatus(locale, "OPEN"),
    assigned: translateStatus(locale, "ASSIGNED"),
    in_progress: translateStatus(locale, "IN_PROGRESS"),
    pending_user: translateStatus(locale, "PENDING_USER"),
    resolved: translateStatus(locale, "RESOLVED"),
    closed: translateStatus(locale, "CLOSED")
  };
  const quickFilterCopy: Record<QueueQuickFilter, string> = {
    all: copy.quickFilters.all,
    urgent: copy.quickFilters.urgent,
    needs_response: copy.quickFilters.needs_response,
    with_attachments: copy.quickFilters.with_attachments
  };
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

      if (quickFilter === "needs_response" && !ticket.needsFirstResponse) {
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
          <p className={styles.kicker}>
            {currentUserRole === "technician" ? copy.roleTechnician : copy.roleAdmin}
          </p>
          <h2>{copy.title}</h2>
          <p className={styles.description}>
            {interpolate(
              currentUserRole === "technician" ? copy.noteTechnician : copy.noteAdmin,
              { count: tickets.length }
            )}
          </p>

          <div className={styles.heroActions}>
            <Link href="/tickets" className={styles.secondaryAction}>
              {copy.openRequester}
            </Link>
            {nextTicket ? (
              <Link href={nextTicket.href} className={styles.primaryAction}>
                {currentUserRole === "technician"
                  ? copy.actionTechnician
                  : copy.actionAdmin}
              </Link>
            ) : null}
          </div>
        </div>

        <aside className={styles.heroRail}>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>{copy.activeWork}</span>
            <strong>{openWork}</strong>
            <p>{copy.activeWorkHelp}</p>
          </div>
          <div className={styles.metricGrid}>
            <div>
              <span>{copy.urgent}</span>
              <strong>{urgentTickets}</strong>
            </div>
            <div>
              <span>{copy.inProgress}</span>
              <strong>{counts.in_progress}</strong>
            </div>
            <div>
              <span>{copy.resolved}</span>
              <strong>{counts.resolved}</strong>
            </div>
            <div>
              <span>{copy.closed}</span>
              <strong>{counts.closed}</strong>
            </div>
          </div>
        </aside>
      </header>

      <section className={styles.sectionHead}>
        <div>
          <p className={styles.sectionLabel}>{copy.snapshotLabel}</p>
          <h3>{copy.snapshotTitle}</h3>
          <p className={styles.resultMeta}>
            {interpolate(copy.showingResults, {
              shown: filteredTickets.length,
              total: tickets.length,
              active: hasActiveFilters ? filteredOpenWork : openWork
            })}
          </p>
        </div>

        <div className={styles.controlPanel}>
          <label className={styles.searchField}>
            <span>{copy.searchLabel}</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={copy.searchPlaceholder}
            />
          </label>

          <label className={styles.selectField}>
            <span>{copy.statusLabel}</span>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as AdminTicketStatus | "all")
              }
            >
              <option value="all">{commonCopy.allStatuses}</option>
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
              {commonCopy.clearFilters}
            </button>
          ) : null}
        </div>
      </section>

      {filteredTickets.length === 0 ? (
        <article className={styles.emptyState}>
          <p className={styles.emptyLabel}>
            {tickets.length === 0 ? copy.emptyNone : copy.emptyFiltered}
          </p>
          <h3>
            {tickets.length === 0
              ? copy.emptyNoneTitle
              : copy.emptyFilteredTitle}
          </h3>
          <p>
            {tickets.length === 0
              ? copy.emptyNoneCopy
              : copy.emptyFilteredCopy}
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
                    {translateStatus(locale, ticket.priority.toUpperCase())}
                  </span>
                </div>
              </div>

              <div className={styles.ticketMeta}>
                <div>
                  <span>{copy.requester}</span>
                  <strong>{ticket.requesterName}</strong>
                </div>
                <div>
                  <span>{copy.department}</span>
                  <strong>{ticket.department ?? commonCopy.notProvided}</strong>
                </div>
                <div>
                  <span>{copy.assignee}</span>
                  <strong>{ticket.assignee ?? commonCopy.notAssigned}</strong>
                </div>
                <div>
                  <span>{copy.response}</span>
                  <strong>{ticket.responseLabel ?? copy.awaitingFirstResponse}</strong>
                </div>
              </div>

              {ticket.summary ? <p className={styles.summary}>{ticket.summary}</p> : null}

              <div className={styles.ticketFooter}>
                <div className={styles.footerNotes}>
                  <span>{ticket.ageLabel}</span>
                  <span>{ticket.updatedLabel}</span>
                  {ticket.responseLabel ? <span>{ticket.responseLabel}</span> : null}
                  {ticket.hasAttachments ? <span>{copy.quickFilters.with_attachments}</span> : null}
                </div>

                <div className={styles.footerActions}>
                  <Link href={ticket.href} className={styles.ghostAction}>
                    {copy.openTicket}
                  </Link>
                  <Link href={ticket.href} className={styles.primaryMiniAction}>
                    {copy.actionAdmin}
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
