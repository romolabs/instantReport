import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionToken } from "@/lib/backend";

import { LoginForm } from "./login-form";
import styles from "./login.module.css";

export default async function LoginPage() {
  const token = await getSessionToken();

  if (token) {
    redirect("/tickets");
  }

  return (
    <main className={styles.shell}>
      <section className={styles.hero}>
        <div className={styles.brandMark}>IR</div>
        <p className={styles.kicker}>InstantReport</p>
        <h1>Help desk intake that feels calm, fast, and traceable.</h1>
        <p className={styles.copy}>
          Built for internal support teams that need clean ticket flow, photo
          evidence, and ISO-friendly records without paying for a heavy SaaS
          stack.
        </p>
        <div className={styles.highlights}>
          <span>Ticket timeline</span>
          <span>Photo attachments</span>
          <span>Status audit trail</span>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <p className={styles.cardEyebrow}>Internal access</p>
          <h2>Sign in with your company email</h2>
          <p>
            This scaffold is ready for the app-managed email/password auth flow
            we chose for the MVP.
          </p>
        </div>

        <LoginForm />

        <div className={styles.recoveryLinks}>
          <Link href="/forgot-password" className={styles.secondaryLink}>
            Forgot your password?
          </Link>
          <Link href="/reset-password" className={styles.secondaryLink}>
            Already have a reset token?
          </Link>
        </div>

        <p className={styles.footerNote}>
          Need the current build?{" "}
          <Link href="/tickets" className={styles.footerLink}>
            Enter the ticket shell
          </Link>
        </p>
      </section>
    </main>
  );
}
