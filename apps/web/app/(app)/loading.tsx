import styles from "../route-state.module.css";

export default function AppLoading() {
  return (
    <section className={styles.appPanel}>
      <p className={styles.kicker}>Loading</p>
      <h1 className={styles.headline}>Refreshing the workspace.</h1>
      <p className={styles.copy}>
        Pulling the latest tickets, comments, assignments, and audit detail.
      </p>

      <div className={styles.skeletonStack} aria-hidden="true">
        <div className={styles.skeletonBlock} />
        <div className={styles.skeletonLine} />
        <div className={`${styles.skeletonLine} ${styles.skeletonLineMedium}`} />
        <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
      </div>
    </section>
  );
}
