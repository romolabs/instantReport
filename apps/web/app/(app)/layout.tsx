import Link from "next/link";
import { isStaffRole, requireAuthenticatedUser } from "@/lib/auth";

import { LogoutButton } from "./logout-button";
import styles from "./shell.module.css";

export default async function AppLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireAuthenticatedUser();
  const navItems = [
    { href: "/tickets", label: "My tickets" },
    { href: "/tickets/new", label: "Create ticket" },
    ...(isStaffRole(user.role)
      ? [{ href: "/admin/tickets", label: "All tickets" }]
      : []),
    ...(user.role === "ADMIN"
      ? [
          { href: "/admin/users", label: "Users" },
          { href: "/admin/categories", label: "Categories" }
        ]
      : [])
  ];

  return (
    <div className={styles.appShell}>
      <aside className={styles.sidebar}>
        <div>
          <p className={styles.brand}>InstantReport</p>
          <h1>Support operations</h1>
          <p className={styles.sidebarCopy}>
            Internal help desk scaffold for intake, triage, resolution, and
            ISO-friendly audit trails.
          </p>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.identity}>
            <span className={styles.statusDot} />
            <div className={styles.identityText}>
              <span>{user.fullName}</span>
              <small>{user.role.toLowerCase()}</small>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <main className={styles.content}>{children}</main>
    </div>
  );
}
