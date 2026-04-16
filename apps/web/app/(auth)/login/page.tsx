import Link from "next/link";
import { redirect } from "next/navigation";

import { LanguageSwitcher } from "@/app/_components/language-switcher";
import { getSessionToken } from "@/lib/backend";
import { getDictionary } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n-server";

import { LoginForm } from "./login-form";
import styles from "./login.module.css";

export default async function LoginPage() {
  const token = await getSessionToken();

  if (token) {
    redirect("/tickets");
  }

  const locale = await getCurrentLocale();
  const dictionary = getDictionary(locale);
  const copy = dictionary.auth.login;

  return (
    <main className={styles.shell}>
      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <p className={styles.kicker}>{copy.heroKicker}</p>
          <LanguageSwitcher
            locale={locale}
            label={dictionary.common.languageLabel}
            options={dictionary.common.languageOptions}
          />
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

        <LoginForm copy={copy} />

        <div className={styles.recoveryLinks}>
          <Link href="/forgot-password" className={styles.secondaryLink}>
            {copy.forgotPassword}
          </Link>
          <Link href="/reset-password" className={styles.secondaryLink}>
            {copy.resetWithToken}
          </Link>
        </div>

        <p className={styles.footerNote}>
          {copy.footerNote}{" "}
          <Link href="/tickets" className={styles.footerLink}>
            {copy.footerLink}
          </Link>
        </p>
      </section>
    </main>
  );
}
