import Link from "next/link";

import { getCurrentLocale } from "@/lib/i18n-server";
import { getDictionary } from "@/lib/i18n";

import styles from "../route-state.module.css";

export default async function AppNotFound() {
  const copy = getDictionary(await getCurrentLocale()).routeState;

  return (
    <section className={styles.appPanel}>
      <p className={styles.kicker}>{copy.notFoundKicker}</p>
      <h1 className={styles.headline}>{copy.notFoundTitle}</h1>
      <p className={styles.copy}>{copy.notFoundCopy}</p>

      <div className={styles.actions}>
        <Link href="/tickets" className={styles.primaryAction}>
          {copy.backToTickets}
        </Link>
        <Link href="/admin/tickets" className={styles.secondaryAction}>
          {copy.openQueue}
        </Link>
      </div>
    </section>
  );
}
