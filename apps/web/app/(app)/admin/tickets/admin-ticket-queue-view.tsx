import Link from "next/link";
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

export function AdminTicketQueueView({
  tickets = [],
  currentUserRole = "admin"
}: AdminTicketQueueViewProps) {
  const counts = countByStatus(tickets);
  const openWork = counts.open + counts.assigned + counts.in_progress + counts.pending_user;
  const urgentTickets = countUrgentTickets(tickets);
  const nextTicket = tickets[0];

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
        </div>
        <div className={styles.filters}>
          <span>All tickets</span>
          <span>Urgent first</span>
          <span>Needs response</span>
        </div>
      </section>

      {tickets.length === 0 ? (
        <article className={styles.emptyState}>
          <p className={styles.emptyLabel}>No tickets in the queue</p>
          <h3>Everything is clear for now.</h3>
          <p>
            When a request comes in, it will show up here with priority, status, attachments, and the
            latest action on record.
          </p>
        </article>
      ) : (
        <div className={styles.queue}>
          {tickets.map((ticket) => (
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
