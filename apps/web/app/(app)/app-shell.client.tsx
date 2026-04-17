"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

import { LanguageSwitcher } from "@/app/_components/language-switcher";
import type { Locale } from "@/lib/i18n";

import { LogoutButton } from "./logout-button";
import styles from "./shell.module.css";

interface NavItem {
  href: string;
  label: string;
}

interface AppShellClientProps {
  children: React.ReactNode;
  locale: Locale;
  appName: string;
  title: string;
  subtitle: string;
  navLabel: string;
  openMenuLabel: string;
  closeMenuLabel: string;
  accountLabel: string;
  languageLabel: string;
  languageOptions: Record<Locale, string>;
  logoutLabel: string;
  loggingOutLabel: string;
  user: {
    fullName: string;
    roleLabel: string;
  };
  navItems: NavItem[];
}

function isActiveLink(pathname: string, href: string) {
  if (href === "/tickets") {
    return (
      pathname === "/tickets" ||
      (pathname.startsWith("/tickets/") && pathname !== "/tickets/new")
    );
  }

  if (href === "/tickets/new") {
    return pathname === "/tickets/new";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShellClient({
  children,
  locale,
  appName,
  title,
  subtitle,
  navLabel,
  openMenuLabel,
  closeMenuLabel,
  accountLabel,
  languageLabel,
  languageOptions,
  logoutLabel,
  loggingOutLabel,
  user,
  navItems
}: AppShellClientProps) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navId = useId();

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isDrawerOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDrawerOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isDrawerOpen]);

  return (
    <div className={styles.appShell}>
      <header className={styles.mobileBar}>
        <div className={styles.mobileBrand}>
          <p className={styles.brand}>{appName}</p>
          <strong>{title}</strong>
        </div>

        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={isDrawerOpen}
          aria-controls={navId}
          aria-label={isDrawerOpen ? closeMenuLabel : openMenuLabel}
          onClick={() => setIsDrawerOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <button
        type="button"
        className={isDrawerOpen ? styles.backdropVisible : styles.backdrop}
        aria-label={closeMenuLabel}
        tabIndex={isDrawerOpen ? 0 : -1}
        onClick={() => setIsDrawerOpen(false)}
      />

      <aside
        className={isDrawerOpen ? `${styles.sidebar} ${styles.drawerOpen}` : styles.sidebar}
      >
        <div className={styles.sidebarInner}>
          <div className={styles.sidebarTop}>
            <div className={styles.sidebarBrandBlock}>
              <p className={styles.brand}>{appName}</p>
              <h1>{title}</h1>
              <p className={styles.sidebarCopy}>{subtitle}</p>
            </div>

            <button
              type="button"
              className={styles.drawerClose}
              aria-label={closeMenuLabel}
              onClick={() => setIsDrawerOpen(false)}
            >
              <span />
              <span />
            </button>
          </div>

          <nav id={navId} className={styles.nav} aria-label={navLabel}>
            {navItems.map((item) => {
              const active = isActiveLink(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={active ? styles.navLinkActive : styles.navLink}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className={styles.sidebarFooter}>
            <div className={styles.accountPanel}>
              <p className={styles.accountLabel}>{accountLabel}</p>
              <div className={styles.identity}>
                <span className={styles.statusDot} />
                <div className={styles.identityText}>
                  <span>{user.fullName}</span>
                  <small>{user.roleLabel}</small>
                </div>
              </div>
            </div>

            <LanguageSwitcher
              locale={locale}
              label={languageLabel}
              options={languageOptions}
            />

            <LogoutButton
              signOutLabel={logoutLabel}
              signingOutLabel={loggingOutLabel}
            />
          </div>
        </div>
      </aside>

      <main className={styles.content}>{children}</main>
    </div>
  );
}
