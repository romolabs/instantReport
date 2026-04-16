import { requireAdminUser } from "@/lib/auth";
import { getUsers } from "@/lib/users";

import { AdminUsersView } from "./admin-users-view";
import styles from "./page.module.css";

function formatMetricValue(count: number) {
  return count.toString().padStart(2, "0");
}

export default async function AdminUsersPage() {
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
          <p className={styles.kicker}>Admin</p>
          <h2>Manage internal identities without breaking the audit trail.</h2>
          <p className={styles.copy}>
            User records drive login, technician assignment, and visibility
            rules. Keep roles and active status current so the queue stays
            accurate.
          </p>
        </div>

        <div className={styles.heroRail}>
          <article className={styles.metricCard}>
            <span className={styles.metricLabel}>Directory size</span>
            <strong>{formatMetricValue(users.length)}</strong>
            <p>All managed accounts currently stored in the help desk system.</p>
          </article>

          <div className={styles.metricGrid}>
            <article>
              <span>Active users</span>
              <strong>{formatMetricValue(activeCount)}</strong>
            </article>
            <article>
              <span>Staff roles</span>
              <strong>{formatMetricValue(staffCount)}</strong>
            </article>
          </div>
        </div>
      </div>

      <AdminUsersView users={users} />
    </section>
  );
}
