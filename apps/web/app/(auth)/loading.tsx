import styles from "../route-state.module.css";

export default function AuthLoading() {
  return (
    <main className={styles.authShell}>
      <section className={styles.authCard}>
        <p className={styles.kicker}>Loading</p>
        <h1 className={styles.headline}>Preparing access.</h1>
        <p className={styles.copy}>
          Checking the current session and loading the authentication flow.
        </p>

        <div className={styles.skeletonStack} aria-hidden="true">
          <div className={styles.skeletonLine} />
          <div className={`${styles.skeletonLine} ${styles.skeletonLineMedium}`} />
          <div className={styles.skeletonBlock} />
        </div>
      </section>
    </main>
  );
}
