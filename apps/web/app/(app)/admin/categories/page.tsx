import { requireAdminUser } from "@/lib/auth";
import { getAllCategories } from "@/lib/categories";

import { CategoryManagementPanel } from "./category-management-panel";
import styles from "./page.module.css";

function formatMetricValue(count: number) {
  return count.toString().padStart(2, "0");
}

export default async function AdminCategoriesPage() {
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
          <p className={styles.kicker}>Admin</p>
          <h1>Keep the category catalog clean and ready for intake.</h1>
          <p className={styles.copy}>
            Categories drive ticket routing, reporting, and intake quality. Use
            this panel to keep the list active, consistent, and easy for
            requesters to understand.
          </p>
        </div>

        <div className={styles.heroRail}>
          <article className={styles.metricCard}>
            <span>Total categories</span>
            <strong>{formatMetricValue(categories.length)}</strong>
          </article>
          <article className={styles.metricCard}>
            <span>Active categories</span>
            <strong>{formatMetricValue(activeCount)}</strong>
          </article>
          <article className={styles.metricCard}>
            <span>Inactive categories</span>
            <strong>{formatMetricValue(inactiveCount)}</strong>
          </article>
        </div>
      </div>

      <CategoryManagementPanel categories={categories} />
    </section>
  );
}
