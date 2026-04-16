import { notFound } from "next/navigation";

import { isStaffRole, requireAuthenticatedUser } from "@/lib/auth";
import { getTicket } from "@/lib/tickets";
import { getAssignableUsers } from "@/lib/users";

import { TicketCommentForm } from "./ticket-comment-form";
import { TicketDetailView } from "./ticket-detail-view";

export default async function TicketDetailPage({
  params
}: Readonly<{
  params: Promise<{ ticketId: string }>;
}>) {
  const { ticketId } = await params;
  const currentUser = await requireAuthenticatedUser();
  const ticket = await getTicket(ticketId);

  if (!ticket) {
    notFound();
  }

  const isStaff = isStaffRole(currentUser.role);
  const assignableUsers =
    currentUser.role === "ADMIN"
      ? await getAssignableUsers()
      : isStaff
        ? [currentUser]
        : [];

  return (
    <section>
      <TicketDetailView
        ticket={ticket}
        currentUserRole={currentUser.role.toLowerCase() as
          | "requester"
          | "technician"
          | "admin"}
        assignableUsers={assignableUsers}
        backHref={isStaff ? "/admin/tickets" : "/tickets"}
        backLabel={isStaff ? "Back to queue" : "Back to my tickets"}
      />
      <TicketCommentForm
        ticketIdentifier={ticket.ticketNumber}
        currentUserRole={currentUser.role.toLowerCase() as
          | "requester"
          | "technician"
          | "admin"}
      />
    </section>
  );
}
