import { getCategories } from "@/lib/categories";

import { CreateTicketForm } from "./create-ticket-form";
import styles from "./page.module.css";

export default async function CreateTicketPage() {
  const categories = await getCategories();

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>New request</p>
          <h1>Document the issue once, then let the process carry it.</h1>
          <p className={styles.copy}>
            This form writes directly into the auditable ticket flow. Strong
            titles, the right category, and visual evidence help the IT team
            respond faster and leave cleaner ISO-friendly records.
          </p>
        </div>

        <div className={styles.heroCards}>
          <article className={styles.heroStat}>
            <span>Best titles</span>
            <strong>Short problem statement plus location or device.</strong>
          </article>
          <article className={styles.heroStat}>
            <span>Best evidence</span>
            <strong>Screenshots, photos, and PDFs up to 10 MB each.</strong>
          </article>
          <article className={styles.heroStat}>
            <span>Best outcome</span>
            <strong>Cleaner triage, cleaner closure, cleaner audit trail.</strong>
          </article>
        </div>
      </div>

      <CreateTicketForm categories={categories} />
    </section>
  );
}
