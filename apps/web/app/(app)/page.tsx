import Link from "next/link";

import { isStaffRole, requireAuthenticatedUser } from "@/lib/auth";
import { getAllCategories } from "@/lib/categories";
import {
  formatRelativeDate,
  getDictionary,
  interpolate,
  translateStatus
} from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n-server";
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

function averageFirstResponseHours(tickets: TicketListItem[], emptyLabel: string) {
  const responded = tickets.filter((ticket) => ticket.firstResponseAt);

  if (responded.length === 0) {
    return emptyLabel;
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

function buildMetricCards(
  tickets: TicketListItem[],
  statusCounts: Record<TicketStatus, number>,
  staffView: boolean,
  copy: ReturnType<typeof getDictionary>["dashboard"]
) {
  if (staffView) {
    return [
      {
        label: copy.metricsStaff.activeWork,
        value: String(
          statusCounts.OPEN +
            statusCounts.ASSIGNED +
            statusCounts.IN_PROGRESS +
            statusCounts.PENDING_USER
        )
      },
      { label: copy.metricsStaff.waitingOnUser, value: String(statusCounts.PENDING_USER) },
      { label: copy.metricsStaff.resolvedThisWeek, value: String(countResolvedRecently(tickets)) },
      { label: copy.metricsStaff.urgentTickets, value: String(countUrgent(tickets)) }
    ];
  }

  return [
    { label: copy.metricsRequester.openMine, value: String(statusCounts.OPEN + statusCounts.ASSIGNED) },
    { label: copy.metricsRequester.inProgress, value: String(statusCounts.IN_PROGRESS) },
    { label: copy.metricsRequester.waitingOnMe, value: String(statusCounts.PENDING_USER) },
    { label: copy.metricsRequester.resolvedThisWeek, value: String(countResolvedRecently(tickets)) }
  ];
}

export default async function AppHomePage() {
  const locale = await getCurrentLocale();
  const dictionary = getDictionary(locale);
  const copy = dictionary.dashboard;
  const user = await requireAuthenticatedUser();
  const adminView = user.role === "ADMIN";
  const [tickets, users, categories] = await Promise.all([
    getTickets(),
    adminView ? getUsers() : Promise.resolve(null),
    adminView ? getAllCategories() : Promise.resolve(null)
  ]);
  const staffView = isStaffRole(user.role);
  const statusCounts = countByStatus(tickets);
  const metrics = buildMetricCards(tickets, statusCounts, staffView, copy);
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
          <p className={styles.kicker}>
            {staffView ? copy.kickerStaff : copy.kickerRequester}
          </p>
          <h2>
            {staffView ? copy.titleStaff : copy.titleRequester}
          </h2>
          <p className={styles.copy}>{staffView ? copy.copyStaff : copy.copyRequester}</p>
        </div>

        <div className={styles.heroActions}>
          <Link href="/tickets/new" className={styles.cta}>
            {copy.createTicket}
          </Link>
          {staffView ? (
            <Link href="/admin/tickets" className={styles.secondaryCta}>
              {copy.openQueue}
            </Link>
          ) : (
            <Link href="/tickets" className={styles.secondaryCta}>
              {copy.reviewTickets}
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
              <p className={styles.sectionLabel}>{copy.workflowLabel}</p>
              <h3>{copy.workflowTitle}</h3>
            </div>
            <span className={styles.inlineMeta}>
              {interpolate(copy.ticketsInView, { count: tickets.length })}
            </span>
          </div>

          <div className={styles.statusGrid}>
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className={styles.statusCard}>
                <span>{translateStatus(locale, status)}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <p className={styles.sectionLabel}>{copy.signalLabel}</p>
              <h3>{copy.signalTitle}</h3>
            </div>
          </div>

          <div className={styles.highlights}>
            <div className={styles.highlightCard}>
              <span>{copy.averageFirstResponse}</span>
              <strong>{averageFirstResponseHours(tickets, copy.notAvailable)}</strong>
            </div>
            <div className={styles.highlightCard}>
              <span>{copy.ticketsWithEvidence}</span>
              <strong>{countWithAttachments(tickets)}</strong>
            </div>
            <div className={styles.highlightCard}>
              <span>{copy.topCategory}</span>
              <strong>{categoryLeaders[0]?.[0] ?? copy.noDataYet}</strong>
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
              <p className={styles.emptyCopy}>{copy.trendsEmpty}</p>
            )}
          </div>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <p className={styles.sectionLabel}>{copy.recentLabel}</p>
            <h3>{staffView ? copy.recentTitleStaff : copy.recentTitleRequester}</h3>
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
                  <span>{translateStatus(locale, ticket.status)}</span>
                  <span>{translateStatus(locale, ticket.priority)}</span>
                  <span>{ticket.category.name}</span>
                  <span>{formatRelativeDate(locale, ticket.updatedAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className={styles.emptyCopy}>{copy.recentEmpty}</p>
        )}
      </section>

      {adminView && users && categories ? (
        <section className={styles.adminGrid}>
          <article className={styles.panel}>
            <div className={styles.panelHead}>
              <div>
                <p className={styles.sectionLabel}>{copy.coverageLabel}</p>
                <h3>{copy.coverageTitle}</h3>
              </div>
            </div>

            <div className={styles.statusGrid}>
              <div className={styles.statusCard}>
                <span>{copy.activeUsers}</span>
                <strong>{activeUsers.length}</strong>
              </div>
              <div className={styles.statusCard}>
                <span>{copy.staffSeats}</span>
                <strong>{staffUsers.length}</strong>
              </div>
              <div className={styles.statusCard}>
                <span>{copy.admins}</span>
                <strong>{activeUsers.filter((entry) => entry.role === "ADMIN").length}</strong>
              </div>
            </div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHead}>
              <div>
                <p className={styles.sectionLabel}>{copy.catalogLabel}</p>
                <h3>{copy.catalogTitle}</h3>
              </div>
            </div>

            <div className={styles.statusGrid}>
              <div className={styles.statusCard}>
                <span>{copy.activeCategories}</span>
                <strong>{activeCategories.length}</strong>
              </div>
              <div className={styles.statusCard}>
                <span>{copy.inactiveCategories}</span>
                <strong>{categories.length - activeCategories.length}</strong>
              </div>
              <div className={styles.statusCard}>
                <span>{copy.liveLeaders}</span>
                <strong>{categoryLeaders.length}</strong>
              </div>
            </div>
          </article>
        </section>
      ) : null}
    </>
  );
}
