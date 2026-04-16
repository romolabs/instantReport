import Link from "next/link";
import { redirect } from "next/navigation";

import { getSessionToken } from "@/lib/backend";
import { getDictionary } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n-server";

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
  const locale = await getCurrentLocale();
  const copy = getDictionary(locale).auth.resetPassword;

  return (
    <main className={styles.shell}>
      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <p className={styles.kicker}>{copy.heroKicker}</p>
        </div>
        <div className={styles.brandMark}>IR</div>
        <h1>{copy.heroTitle}</h1>
        <p className={styles.copy}>{copy.heroCopy}</p>
        <div className={styles.highlights}>
          {copy.highlights.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <p className={styles.cardEyebrow}>{copy.cardEyebrow}</p>
          <h2>{copy.cardTitle}</h2>
          <p>{copy.cardCopy}</p>
        </div>

        <ResetPasswordForm locale={locale} copy={copy} initialToken={params.token ?? ""} />

        <p className={styles.footerNote}>
          {copy.footerNote}{" "}
          <Link href="/forgot-password" className={styles.footerLink}>
            {copy.footerLink}
          </Link>
        </p>
      </section>
    </main>
  );
}
