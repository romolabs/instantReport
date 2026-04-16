import { requireAdminUser } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n-server";
import { getUsers } from "@/lib/users";

import { AdminUsersView } from "./admin-users-view";
import styles from "./page.module.css";

function formatMetricValue(count: number) {
  return count.toString().padStart(2, "0");
}

export default async function AdminUsersPage() {
  const locale = await getCurrentLocale();
  const copy = getDictionary(locale).admin.users;
  await requireAdminUser();
  const users = await getUsers();
  const activeCount = users.filter((user) => user.isActive).length;
  const staffCount = users.filter(
    (user) => user.role === "TECHNICIAN" || user.role === "ADMIN"
  ).length;

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>{copy.heroKicker}</p>
          <h2>{copy.heroTitle}</h2>
          <p className={styles.copy}>{copy.heroCopy}</p>
        </div>

        <div className={styles.heroRail}>
          <article className={styles.metricCard}>
            <span className={styles.metricLabel}>{copy.directorySize}</span>
            <strong>{formatMetricValue(users.length)}</strong>
            <p>{copy.directorySizeHelp}</p>
          </article>

          <div className={styles.metricGrid}>
            <article>
              <span>{copy.activeUsers}</span>
              <strong>{formatMetricValue(activeCount)}</strong>
            </article>
            <article>
              <span>{copy.staffRoles}</span>
              <strong>{formatMetricValue(staffCount)}</strong>
            </article>
          </div>
        </div>
      </div>

      <AdminUsersView locale={locale} users={users} />
    </section>
  );
}
