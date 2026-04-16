import Link from "next/link";
import { getTickets } from "@/lib/tickets";
import styles from "./tickets.module.css";

function formatRelativeDate(input: string) {
  const date = new Date(input);
  const delta = Date.now() - date.getTime();
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
  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString();
}

export default async function MyTicketsPage() {
  const tickets = await getTickets();

  return (
    <section>
      <div className={styles.header}>
        <div>
          <p className={styles.kicker}>My tickets</p>
          <h2>Issues assigned to or created by me.</h2>
        </div>
        <Link href="/tickets/new" className={styles.linkButton}>
          New ticket
        </Link>
      </div>

      <div className={styles.list}>
        {tickets.length === 0 ? (
          <article className={styles.ticketCard}>
            <div>
              <p>No tickets yet</p>
              <h3>Your submitted tickets will appear here.</h3>
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
              <span>{ticket.status.replaceAll("_", " ")}</span>
              <span>{ticket.priority}</span>
              <span>{formatRelativeDate(ticket.updatedAt)}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
