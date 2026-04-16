import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionToken } from "@/lib/backend";

import { ForgotPasswordForm } from "./forgot-password-form";
import styles from "../login/login.module.css";

export default async function ForgotPasswordPage() {
  const token = await getSessionToken();

  if (token) {
    redirect("/tickets");
  }

  return (
    <main className={styles.shell}>
      <section className={styles.hero}>
        <div className={styles.brandMark}>IR</div>
        <p className={styles.kicker}>Recovery</p>
        <h1>Get a reset token without losing the audit trail.</h1>
        <p className={styles.copy}>
          This flow keeps access recovery inside the same app-managed auth
          system. For now, the backend returns a temporary raw token directly
          while email delivery is still pending.
        </p>
        <div className={styles.highlights}>
          <span>Token-based reset</span>
          <span>No public signup</span>
          <span>Internal-only access</span>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <p className={styles.cardEyebrow}>Password recovery</p>
          <h2>Request a reset token</h2>
          <p>
            Enter your company email. If the account exists, the app will start
            a reset request and show the temporary token in this local-only MVP.
          </p>
        </div>

        <ForgotPasswordForm />

        <p className={styles.footerNote}>
          Remembered it?{" "}
          <Link href="/login" className={styles.footerLink}>
            Back to sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
