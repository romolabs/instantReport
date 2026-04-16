"use client";

import Link from "next/link";

import { getClientLocale, getDictionary } from "@/lib/i18n";

import styles from "../route-state.module.css";

export default function AuthError({
  error,
  reset
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  const copy = getDictionary(getClientLocale()).routeState;

  return (
    <main className={styles.authShell}>
      <section className={styles.authCard}>
        <p className={styles.kicker}>{copy.authErrorKicker}</p>
        <h1 className={styles.headline}>{copy.authErrorTitle}</h1>
        <p className={styles.copy}>
          {error.message || copy.authErrorFallback}
        </p>

        <div className={styles.actions}>
          <button type="button" onClick={reset} className={styles.primaryAction}>
            {copy.tryAgain}
          </button>
          <Link href="/login" className={styles.secondaryAction}>
            {copy.backToSignIn}
          </Link>
        </div>
      </section>
    </main>
  );
}
