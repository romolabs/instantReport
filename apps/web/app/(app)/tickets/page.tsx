import Link from "next/link";
import { formatRelativeDate, getDictionary, translateStatus } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n-server";
import { getTickets } from "@/lib/tickets";
import styles from "./tickets.module.css";

export default async function MyTicketsPage() {
  const locale = await getCurrentLocale();
  const dictionary = getDictionary(locale);
  const tickets = await getTickets();
  const copy = dictionary.tickets.list;
  const summary = [
    {
      label: translateStatus(locale, "OPEN"),
      value: tickets.filter(
        (ticket) => ticket.status === "OPEN" || ticket.status === "ASSIGNED"
      ).length
    },
    {
      label: translateStatus(locale, "PENDING_USER"),
      value: tickets.filter((ticket) => ticket.status === "PENDING_USER").length
    },
    {
      label: translateStatus(locale, "RESOLVED"),
      value: tickets.filter(
        (ticket) => ticket.status === "RESOLVED" || ticket.status === "CLOSED"
      ).length
    }
  ];

  return (
    <section>
      <div className={styles.header}>
        <div className={styles.headerCopy}>
          <p className={styles.kicker}>{copy.kicker}</p>
          <h2>{copy.title}</h2>
          {tickets.length > 0 ? (
            <div className={styles.summaryRow}>
              {summary.map((item) => (
                <div key={item.label} className={styles.summaryChip}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <Link href="/tickets/new" className={styles.linkButton}>
          {copy.action}
        </Link>
      </div>

      <div className={styles.list}>
        {tickets.length === 0 ? (
          <article className={styles.ticketCard}>
            <div>
              <p>{copy.emptyEyebrow}</p>
              <h3>{copy.emptyTitle}</h3>
            </div>
          </article>
        ) : null}
        {tickets.map((ticket) => (
          <Link
            key={ticket.id}
            href={`/tickets/${ticket.ticketNumber}`}
            className={styles.ticketCard}
          >
            <div>
              <p>{ticket.ticketNumber}</p>
              <h3>{ticket.title}</h3>
            </div>
            <div className={styles.meta}>
              <span>{translateStatus(locale, ticket.status)}</span>
              <span>{translateStatus(locale, ticket.priority)}</span>
              <span>{formatRelativeDate(locale, ticket.updatedAt)}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
