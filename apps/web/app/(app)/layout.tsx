import Link from "next/link";
import { isStaffRole, requireAuthenticatedUser } from "@/lib/auth";
import { LanguageSwitcher } from "@/app/_components/language-switcher";
import { getDictionary, translateRole } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n-server";

import { LogoutButton } from "./logout-button";
import styles from "./shell.module.css";

export default async function AppLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireAuthenticatedUser();
  const locale = await getCurrentLocale();
  const dictionary = getDictionary(locale);
  const navItems = [
    { href: "/tickets", label: dictionary.appShell.nav.tickets },
    { href: "/tickets/new", label: dictionary.appShell.nav.newTicket },
    ...(isStaffRole(user.role)
      ? [{ href: "/admin/tickets", label: dictionary.appShell.nav.allTickets }]
      : []),
    ...(user.role === "ADMIN"
      ? [
          { href: "/admin/users", label: dictionary.appShell.nav.users },
          { href: "/admin/categories", label: dictionary.appShell.nav.categories }
        ]
      : [])
  ];

  return (
    <div className={styles.appShell}>
      <aside className={styles.sidebar}>
        <div>
          <div className={styles.topMeta}>
            <p className={styles.brand}>{dictionary.common.appName}</p>
            <LanguageSwitcher
              locale={locale}
              label={dictionary.common.languageLabel}
              options={dictionary.common.languageOptions}
            />
          </div>
          <h1>{dictionary.appShell.title}</h1>
          <p className={styles.sidebarCopy}>
            {dictionary.appShell.subtitle}
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
              <small>{translateRole(locale, user.role)}</small>
            </div>
          </div>
          <LogoutButton
            signOutLabel={dictionary.appShell.logout}
            signingOutLabel={dictionary.appShell.loggingOut}
          />
        </div>
      </aside>

      <main className={styles.content}>{children}</main>
    </div>
  );
}
