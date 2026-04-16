import { requireAdminUser } from "@/lib/auth";
import { getAllCategories } from "@/lib/categories";
import { getDictionary } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n-server";

import { CategoryManagementPanel } from "./category-management-panel";
import styles from "./page.module.css";

function formatMetricValue(count: number) {
  return count.toString().padStart(2, "0");
}

export default async function AdminCategoriesPage() {
  const locale = await getCurrentLocale();
  const copy = getDictionary(locale).admin.categories;
  await requireAdminUser();
  const categories = await getAllCategories();
  const activeCount = categories.filter((category) => category.isActive).length;
  const inactiveCount = categories.length - activeCount;

  return (
    <section className={styles.page}>
      <div className={styles.glow} />
      <div className={styles.glowSecondary} />

      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>{copy.heroKicker}</p>
          <h1>{copy.heroTitle}</h1>
          <p className={styles.copy}>{copy.heroCopy}</p>
        </div>

        <div className={styles.heroRail}>
          <article className={styles.metricCard}>
            <span>{copy.totalCategories}</span>
            <strong>{formatMetricValue(categories.length)}</strong>
          </article>
          <article className={styles.metricCard}>
            <span>{copy.activeCategories}</span>
            <strong>{formatMetricValue(activeCount)}</strong>
          </article>
          <article className={styles.metricCard}>
            <span>{copy.inactiveCategories}</span>
            <strong>{formatMetricValue(inactiveCount)}</strong>
          </article>
        </div>
      </div>

      <CategoryManagementPanel locale={locale} categories={categories} />
    </section>
  );
}
