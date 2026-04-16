import Link from "next/link";

import styles from "../route-state.module.css";

export default function AppNotFound() {
  return (
    <section className={styles.appPanel}>
      <p className={styles.kicker}>Not found</p>
      <h1 className={styles.headline}>That record is not in the current workspace.</h1>
      <p className={styles.copy}>
        The ticket may have an invalid number, an outdated link, or it may no
        longer be visible from your current role.
      </p>

      <div className={styles.actions}>
        <Link href="/tickets" className={styles.primaryAction}>
          Go to tickets
        </Link>
        <Link href="/admin/tickets" className={styles.secondaryAction}>
          Open staff queue
        </Link>
      </div>
    </section>
  );
}
