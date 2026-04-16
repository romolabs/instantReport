import Link from "next/link";
import styles from "./home.module.css";

const metrics = [
  { label: "Open tickets", value: "18" },
  { label: "Waiting on user", value: "6" },
  { label: "Closed this week", value: "42" }
];

export default function AppHomePage() {
  return (
    <>
      <section className={styles.hero}>
        <div>
          <p className={styles.kicker}>Dashboard</p>
          <h2>Operational snapshot for the IT desk.</h2>
          <p className={styles.copy}>
            This shell is intentionally lightweight for now. It gives us a
            strong structure for the requester and technician workflows while
            the API continues to evolve.
          </p>
        </div>
        <Link href="/tickets/new" className={styles.cta}>
          Create ticket
        </Link>
      </section>

      <section className={styles.grid}>
        {metrics.map((metric) => (
          <article key={metric.label} className={styles.metricCard}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </section>
    </>
  );
}
