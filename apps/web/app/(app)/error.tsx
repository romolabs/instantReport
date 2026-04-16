"use client";

import Link from "next/link";

import styles from "../route-state.module.css";

export default function AppError({
  error,
  reset
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <section className={styles.appPanel}>
      <p className={styles.kicker}>Something broke</p>
      <h1 className={styles.headline}>The ticket workspace hit an unexpected error.</h1>
      <p className={styles.copy}>
        {error.message || "Try the request again. If it keeps happening, return to the queue and reopen the record from there."}
      </p>

      <div className={styles.actions}>
        <button type="button" onClick={reset} className={styles.primaryAction}>
          Try again
        </button>
        <Link href="/tickets" className={styles.secondaryAction}>
          Back to tickets
        </Link>
      </div>
    </section>
  );
}
