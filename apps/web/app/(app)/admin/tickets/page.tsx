import {
  AdminTicketQueueView,
  type AdminTicket,
  type AdminTicketPriority,
  type AdminTicketStatus
} from "./admin-ticket-queue-view";

import { requireStaffUser } from "@/lib/auth";
import { formatRelativeDate, getDictionary, interpolate } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n-server";
import { type TicketListItem, getTickets } from "@/lib/tickets";

function formatAgeLabel(locale: Awaited<ReturnType<typeof getCurrentLocale>>, createdAt: string) {
  const created = new Date(createdAt);
  const delta = Date.now() - created.getTime();
  const minutes = Math.floor(delta / 60000);

  if (minutes < 60) {
    return formatRelativeDate(locale, createdAt);
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return formatRelativeDate(locale, createdAt);
  }

  return formatRelativeDate(locale, createdAt);
}

function formatResponseLabel(
  locale: Awaited<ReturnType<typeof getCurrentLocale>>,
  ticket: TicketListItem
) {
  const copy = getDictionary(locale).admin.tickets;

  if (ticket.closedAt) {
    return `${copy.closed} ${formatRelativeDate(locale, ticket.closedAt)}`;
  }

  if (ticket.resolvedAt) {
    return `${copy.resolved} ${formatRelativeDate(locale, ticket.resolvedAt)}`;
  }

  if (ticket.firstResponseAt) {
    return `${copy.response} ${formatRelativeDate(locale, ticket.firstResponseAt)}`;
  }

  return copy.awaitingFirstResponse;
}

function comparePriority(
  left: TicketListItem["priority"],
  right: TicketListItem["priority"]
) {
  const order: Record<TicketListItem["priority"], number> = {
    URGENT: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3
  } as const;

  return order[left] - order[right];
}

function compareStatus(left: TicketListItem["status"], right: TicketListItem["status"]) {
  const order: Record<TicketListItem["status"], number> = {
    OPEN: 0,
    ASSIGNED: 1,
    IN_PROGRESS: 2,
    PENDING_USER: 3,
    RESOLVED: 4,
    CLOSED: 5
  } as const;

  return order[left] - order[right];
}

function toQueueTicket(
  locale: Awaited<ReturnType<typeof getCurrentLocale>>,
  ticket: TicketListItem
): AdminTicket {
  return {
    id: ticket.ticketNumber,
    href: `/tickets/${ticket.ticketNumber}`,
    title: ticket.title,
    requesterName: ticket.requester.fullName,
    department: ticket.requester.department,
    priority: ticket.priority.toLowerCase() as AdminTicketPriority,
    status: ticket.status.toLowerCase() as AdminTicketStatus,
    ageLabel: formatAgeLabel(locale, ticket.createdAt),
    updatedLabel: formatRelativeDate(locale, ticket.updatedAt),
    assignee: ticket.assignedTo?.fullName ?? null,
    hasAttachments: ticket._count.attachments > 0,
    responseLabel: formatResponseLabel(locale, ticket),
    summary: ticket.description,
    needsFirstResponse: !ticket.firstResponseAt
  };
}

export default async function AdminTicketsPage() {
  const locale = await getCurrentLocale();
  const user = await requireStaffUser();
  const tickets = await getTickets();
  const queueTickets = [...tickets]
    .sort((left, right) => {
      const priorityDelta = comparePriority(left.priority, right.priority);
      if (priorityDelta !== 0) {
        return priorityDelta;
      }

      const statusDelta = compareStatus(left.status, right.status);
      if (statusDelta !== 0) {
        return statusDelta;
      }

      return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    })
    .map((ticket) => toQueueTicket(locale, ticket));

  return (
    <AdminTicketQueueView
      locale={locale}
      tickets={queueTickets}
      currentUserRole={user.role === "ADMIN" ? "admin" : "technician"}
    />
  );
}
