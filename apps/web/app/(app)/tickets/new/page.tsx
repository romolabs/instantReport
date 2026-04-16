import { getCategories } from "@/lib/categories";
import { getDictionary } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n-server";

import { CreateTicketForm } from "./create-ticket-form";
import styles from "./page.module.css";

export default async function CreateTicketPage() {
  const locale = await getCurrentLocale();
  const dictionary = getDictionary(locale);
  const copy = dictionary.tickets.create;
  const categories = await getCategories();

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>{copy.pageKicker}</p>
          <h1>{copy.pageTitle}</h1>
          <p className={styles.copy}>{copy.pageCopy}</p>
        </div>

        <div className={styles.heroCards}>
          <article className={styles.heroStat}>
            <span>{copy.statTitles.titles}</span>
            <strong>{copy.statBodies.titles}</strong>
          </article>
          <article className={styles.heroStat}>
            <span>{copy.statTitles.evidence}</span>
            <strong>{copy.statBodies.evidence}</strong>
          </article>
          <article className={styles.heroStat}>
            <span>{copy.statTitles.outcome}</span>
            <strong>{copy.statBodies.outcome}</strong>
          </article>
        </div>
      </div>

      <CreateTicketForm categories={categories} locale={locale} copy={copy} />
    </section>
  );
}
