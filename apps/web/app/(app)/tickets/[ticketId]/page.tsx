import { notFound } from "next/navigation";

import { isStaffRole, requireAuthenticatedUser } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n-server";
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
  const locale = await getCurrentLocale();
  const dictionary = getDictionary(locale);
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
        locale={locale}
        detailCopy={dictionary.tickets.detail}
        attachmentCopy={dictionary.tickets.attachmentForm}
        staffActionsCopy={dictionary.tickets.staffActions}
        commonCopy={dictionary.common}
        ticket={ticket}
        currentUserRole={currentUser.role.toLowerCase() as
          | "requester"
          | "technician"
          | "admin"}
        assignableUsers={assignableUsers}
        backHref={isStaff ? "/admin/tickets" : "/tickets"}
        backLabel={
          isStaff
            ? dictionary.tickets.detail.backToQueue
            : dictionary.tickets.detail.backToMyTickets
        }
      />
      <TicketCommentForm
        ticketIdentifier={ticket.ticketNumber}
        locale={locale}
        copy={dictionary.tickets.commentForm}
        currentUserRole={currentUser.role.toLowerCase() as
          | "requester"
          | "technician"
          | "admin"}
      />
    </section>
  );
}
