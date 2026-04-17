import { isStaffRole, requireAuthenticatedUser } from "@/lib/auth";
import { getDictionary, translateRole } from "@/lib/i18n";
import { getCurrentLocale } from "@/lib/i18n-server";

import { AppShellClient } from "./app-shell.client";

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
    <AppShellClient
      locale={locale}
      appName={dictionary.common.appName}
      title={dictionary.appShell.title}
      subtitle={dictionary.appShell.subtitle}
      navLabel={dictionary.appShell.navigation}
      openMenuLabel={dictionary.appShell.openMenu}
      closeMenuLabel={dictionary.appShell.closeMenu}
      accountLabel={dictionary.appShell.account}
      languageLabel={dictionary.common.languageLabel}
      languageOptions={dictionary.common.languageOptions}
      logoutLabel={dictionary.appShell.logout}
      loggingOutLabel={dictionary.appShell.loggingOut}
      user={{
        fullName: user.fullName,
        roleLabel: translateRole(locale, user.role)
      }}
      navItems={navItems}
    >
      {children}
    </AppShellClient>
  );
}
