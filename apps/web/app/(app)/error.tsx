"use client";

import Link from "next/link";

import { getClientLocale, getDictionary } from "@/lib/i18n";

import styles from "../route-state.module.css";

export default function AppError({
  error,
  reset
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  const copy = getDictionary(getClientLocale()).routeState;

  return (
    <section className={styles.appPanel}>
      <p className={styles.kicker}>{copy.appErrorKicker}</p>
      <h1 className={styles.headline}>{copy.appErrorTitle}</h1>
      <p className={styles.copy}>
        {error.message || copy.appErrorFallback}
      </p>

      <div className={styles.actions}>
        <button type="button" onClick={reset} className={styles.primaryAction}>
          {copy.tryAgain}
        </button>
        <Link href="/tickets" className={styles.secondaryAction}>
          {copy.backToTickets}
        </Link>
      </div>
    </section>
  );
}
