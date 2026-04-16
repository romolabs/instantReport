import {
  AdminTicketQueueView,
  type AdminTicket,
  type AdminTicketPriority,
  type AdminTicketStatus
} from "./admin-ticket-queue-view";

import { requireStaffUser } from "@/lib/auth";
import { type TicketListItem, getTickets } from "@/lib/tickets";

function formatRelativeDate(input: string) {
  const date = new Date(input);
  const delta = Date.now() - date.getTime();
  const minutes = Math.floor(delta / 60000);

  if (minutes < 1) {
    return "Just updated";
  }

  if (minutes < 60) {
    return `Updated ${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `Updated ${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `Updated ${days}d ago`;
}

function formatAgeLabel(createdAt: string) {
  const created = new Date(createdAt);
  const delta = Date.now() - created.getTime();
  const minutes = Math.floor(delta / 60000);

  if (minutes < 60) {
    return `${Math.max(minutes, 1)}m open`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h open`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d open`;
}

function formatResponseLabel(ticket: TicketListItem) {
  if (ticket.closedAt) {
    return `Closed ${formatRelativeDate(ticket.closedAt).replace("Updated ", "")}`;
  }

  if (ticket.resolvedAt) {
    return `Resolved ${formatRelativeDate(ticket.resolvedAt).replace("Updated ", "")}`;
  }

  if (ticket.firstResponseAt) {
    return `First response ${formatRelativeDate(ticket.firstResponseAt).replace(
      "Updated ",
      ""
    )}`;
  }

  return "Awaiting first response";
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

function toQueueTicket(ticket: TicketListItem): AdminTicket {
  return {
    id: ticket.ticketNumber,
    href: `/tickets/${ticket.ticketNumber}`,
    title: ticket.title,
    requesterName: ticket.requester.fullName,
    department: ticket.requester.department,
    priority: ticket.priority.toLowerCase() as AdminTicketPriority,
    status: ticket.status.toLowerCase() as AdminTicketStatus,
    ageLabel: formatAgeLabel(ticket.createdAt),
    updatedLabel: formatRelativeDate(ticket.updatedAt),
    assignee: ticket.assignedTo?.fullName ?? null,
    hasAttachments: ticket._count.attachments > 0,
    responseLabel: formatResponseLabel(ticket),
    summary: ticket.description
  };
}

export default async function AdminTicketsPage() {
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
    .map(toQueueTicket);

  return (
    <AdminTicketQueueView
      tickets={queueTickets}
      currentUserRole={user.role === "ADMIN" ? "admin" : "technician"}
    />
  );
}
