"use client";

import Link from "next/link";

import styles from "../route-state.module.css";

export default function AuthError({
  error,
  reset
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <main className={styles.authShell}>
      <section className={styles.authCard}>
        <p className={styles.kicker}>Access error</p>
        <h1 className={styles.headline}>The authentication flow could not finish.</h1>
        <p className={styles.copy}>
          {error.message || "Try the request again, or return to the sign-in screen and restart the flow."}
        </p>

        <div className={styles.actions}>
          <button type="button" onClick={reset} className={styles.primaryAction}>
            Try again
          </button>
          <Link href="/login" className={styles.secondaryAction}>
            Back to sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
