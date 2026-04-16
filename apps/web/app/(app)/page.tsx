import Link from "next/link";

import { isStaffRole, requireAuthenticatedUser } from "@/lib/auth";
import { getAllCategories } from "@/lib/categories";
import { getTickets, type TicketListItem } from "@/lib/tickets";
import { getUsers } from "@/lib/users";

import styles from "./home.module.css";

type TicketStatus =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "PENDING_USER"
  | "RESOLVED"
  | "CLOSED";

function countByStatus(tickets: TicketListItem[]) {
  return tickets.reduce<Record<TicketStatus, number>>(
    (acc, ticket) => {
      const status = ticket.status as TicketStatus;
      acc[status] += 1;
      return acc;
    },
    {
      OPEN: 0,
      ASSIGNED: 0,
      IN_PROGRESS: 0,
      PENDING_USER: 0,
      RESOLVED: 0,
      CLOSED: 0
    }
  );
}

function countUrgent(tickets: TicketListItem[]) {
  return tickets.filter((ticket) => ticket.priority === "URGENT").length;
}

function countWithAttachments(tickets: TicketListItem[]) {
  return tickets.filter((ticket) => ticket._count.attachments > 0).length;
}

function countResolvedRecently(tickets: TicketListItem[]) {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return tickets.filter((ticket) => {
    const value = ticket.resolvedAt ?? ticket.closedAt;
    return value ? new Date(value).getTime() >= cutoff : false;
  }).length;
}

function averageFirstResponseHours(tickets: TicketListItem[]) {
  const responded = tickets.filter((ticket) => ticket.firstResponseAt);

  if (responded.length === 0) {
    return "N/A";
  }

  const totalHours = responded.reduce((sum, ticket) => {
    const createdAt = new Date(ticket.createdAt).getTime();
    const respondedAt = new Date(ticket.firstResponseAt ?? ticket.createdAt).getTime();
    return sum + (respondedAt - createdAt) / (1000 * 60 * 60);
  }, 0);

  const average = totalHours / responded.length;
  return `${average.toFixed(1)}h`;
}

function topCategories(tickets: TicketListItem[]) {
  const counts = new Map<string, number>();

  for (const ticket of tickets) {
    counts.set(ticket.category.name, (counts.get(ticket.category.name) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4);
}

function recentTickets(tickets: TicketListItem[]) {
  return [...tickets]
    .sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    )
    .slice(0, 5);
}

function formatRelativeDate(input: string) {
  const delta = Date.now() - new Date(input).getTime();
  const minutes = Math.floor(delta / 60000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function statusLabel(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildMetricCards(
  tickets: TicketListItem[],
  statusCounts: Record<TicketStatus, number>,
  staffView: boolean
) {
  if (staffView) {
    return [
      {
        label: "Active work",
        value: String(
          statusCounts.OPEN +
            statusCounts.ASSIGNED +
            statusCounts.IN_PROGRESS +
            statusCounts.PENDING_USER
        )
      },
      { label: "Waiting on user", value: String(statusCounts.PENDING_USER) },
      { label: "Resolved this week", value: String(countResolvedRecently(tickets)) },
      { label: "Urgent tickets", value: String(countUrgent(tickets)) }
    ];
  }

  return [
    { label: "My open tickets", value: String(statusCounts.OPEN + statusCounts.ASSIGNED) },
    { label: "In progress", value: String(statusCounts.IN_PROGRESS) },
    { label: "Waiting on me", value: String(statusCounts.PENDING_USER) },
    { label: "Resolved this week", value: String(countResolvedRecently(tickets)) }
  ];
}

export default async function AppHomePage() {
  const user = await requireAuthenticatedUser();
  const adminView = user.role === "ADMIN";
  const [tickets, users, categories] = await Promise.all([
    getTickets(),
    adminView ? getUsers() : Promise.resolve(null),
    adminView ? getAllCategories() : Promise.resolve(null)
  ]);
  const staffView = isStaffRole(user.role);
  const statusCounts = countByStatus(tickets);
  const metrics = buildMetricCards(tickets, statusCounts, staffView);
  const categoryLeaders = topCategories(tickets);
  const latestTickets = recentTickets(tickets);
  const activeUsers = users?.filter((entry) => entry.isActive) ?? [];
  const staffUsers =
    users?.filter((entry) => entry.isActive && entry.role !== "REQUESTER") ?? [];
  const activeCategories = categories?.filter((entry) => entry.isActive) ?? [];

  return (
    <>
      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}>{staffView ? "Operations dashboard" : "My dashboard"}</p>
          <h2>
            {staffView
              ? "See queue pressure, response pace, and the work that needs attention next."
              : "Track your requests without losing the full support history."}
          </h2>
          <p className={styles.copy}>
            {staffView
              ? "This view is computed from the live ticket stream, so the team can spot workload, urgency, and category concentration without opening each case one by one."
              : "This view shows the live state of your tickets, including what is moving, what is waiting on you, and where recent updates landed."}
          </p>
        </div>

        <div className={styles.heroActions}>
          <Link href="/tickets/new" className={styles.cta}>
            Create ticket
          </Link>
          {staffView ? (
            <Link href="/admin/tickets" className={styles.secondaryCta}>
              Open queue
            </Link>
          ) : (
            <Link href="/tickets" className={styles.secondaryCta}>
              Review my tickets
            </Link>
          )}
        </div>
      </section>

      <section className={styles.grid}>
        {metrics.map((metric) => (
          <article key={metric.label} className={styles.metricCard}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </section>

      <section className={styles.reportGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <p className={styles.sectionLabel}>Workflow</p>
              <h3>Status breakdown</h3>
            </div>
            <span className={styles.inlineMeta}>{tickets.length} tickets in view</span>
          </div>

          <div className={styles.statusGrid}>
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className={styles.statusCard}>
                <span>{statusLabel(status)}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <p className={styles.sectionLabel}>Signal</p>
              <h3>Operational highlights</h3>
            </div>
          </div>

          <div className={styles.highlights}>
            <div className={styles.highlightCard}>
              <span>Average first response</span>
              <strong>{averageFirstResponseHours(tickets)}</strong>
            </div>
            <div className={styles.highlightCard}>
              <span>Tickets with evidence</span>
              <strong>{countWithAttachments(tickets)}</strong>
            </div>
            <div className={styles.highlightCard}>
              <span>Top category</span>
              <strong>{categoryLeaders[0]?.[0] ?? "No data yet"}</strong>
            </div>
          </div>

          <div className={styles.categoryList}>
            {categoryLeaders.length > 0 ? (
              categoryLeaders.map(([name, count]) => (
                <div key={name} className={styles.categoryRow}>
                  <span>{name}</span>
                  <strong>{count}</strong>
                </div>
              ))
            ) : (
              <p className={styles.emptyCopy}>Category trends will appear once tickets exist.</p>
            )}
          </div>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <p className={styles.sectionLabel}>Recent activity</p>
            <h3>{staffView ? "Latest queue movement" : "Latest changes to my tickets"}</h3>
          </div>
        </div>

        {latestTickets.length > 0 ? (
          <div className={styles.ticketList}>
            {latestTickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/tickets/${ticket.ticketNumber}`}
                className={styles.ticketCard}
              >
                <div>
                  <p className={styles.ticketNumber}>{ticket.ticketNumber}</p>
                  <h4>{ticket.title}</h4>
                </div>

                <div className={styles.ticketMeta}>
                  <span>{statusLabel(ticket.status)}</span>
                  <span>{ticket.priority.toLowerCase()}</span>
                  <span>{ticket.category.name}</span>
                  <span>{formatRelativeDate(ticket.updatedAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className={styles.emptyCopy}>
            No ticket activity yet. Create the first ticket to start the record.
          </p>
        )}
      </section>

      {adminView && users && categories ? (
        <section className={styles.adminGrid}>
          <article className={styles.panel}>
            <div className={styles.panelHead}>
              <div>
                <p className={styles.sectionLabel}>Coverage</p>
                <h3>User directory</h3>
              </div>
            </div>

            <div className={styles.statusGrid}>
              <div className={styles.statusCard}>
                <span>Active users</span>
                <strong>{activeUsers.length}</strong>
              </div>
              <div className={styles.statusCard}>
                <span>Staff seats</span>
                <strong>{staffUsers.length}</strong>
              </div>
              <div className={styles.statusCard}>
                <span>Admins</span>
                <strong>{activeUsers.filter((entry) => entry.role === "ADMIN").length}</strong>
              </div>
            </div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHead}>
              <div>
                <p className={styles.sectionLabel}>Catalog</p>
                <h3>Category coverage</h3>
              </div>
            </div>

            <div className={styles.statusGrid}>
              <div className={styles.statusCard}>
                <span>Active categories</span>
                <strong>{activeCategories.length}</strong>
              </div>
              <div className={styles.statusCard}>
                <span>Inactive categories</span>
                <strong>{categories.length - activeCategories.length}</strong>
              </div>
              <div className={styles.statusCard}>
                <span>Live leaders</span>
                <strong>{categoryLeaders.length}</strong>
              </div>
            </div>
          </article>
        </section>
      ) : null}
    </>
  );
}
