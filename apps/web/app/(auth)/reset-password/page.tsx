import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionToken } from "@/lib/backend";

import { ResetPasswordForm } from "./reset-password-form";
import styles from "../login/login.module.css";

export default async function ResetPasswordPage({
  searchParams
}: Readonly<{
  searchParams: Promise<{ token?: string }>;
}>) {
  const token = await getSessionToken();

  if (token) {
    redirect("/tickets");
  }

  const params = await searchParams;

  return (
    <main className={styles.shell}>
      <section className={styles.hero}>
        <div className={styles.brandMark}>IR</div>
        <p className={styles.kicker}>Recovery</p>
        <h1>Set a new password and get back into the queue.</h1>
        <p className={styles.copy}>
          Paste the reset token from the current MVP flow, choose a new
          password, and return to the normal ticket shell.
        </p>
        <div className={styles.highlights}>
          <span>Minimum 8 characters</span>
          <span>Token validation</span>
          <span>Back to login fast</span>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <p className={styles.cardEyebrow}>Reset password</p>
          <h2>Finish the recovery flow</h2>
          <p>
            This screen uses the same backend reset endpoint that the future
            email-driven flow will keep using.
          </p>
        </div>

        <ResetPasswordForm initialToken={params.token ?? ""} />

        <p className={styles.footerNote}>
          Need a token first?{" "}
          <Link href="/forgot-password" className={styles.footerLink}>
            Request one here
          </Link>
        </p>
      </section>
    </main>
  );
}
