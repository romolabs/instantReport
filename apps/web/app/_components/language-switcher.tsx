"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

import type { Locale } from "@/lib/i18n";

import styles from "./language-switcher.module.css";

interface LanguageSwitcherProps {
  locale: Locale;
  label: string;
  options: Record<Locale, string>;
}

export function LanguageSwitcher({
  locale,
  label,
  options
}: LanguageSwitcherProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleChange(nextLocale: Locale) {
    if (nextLocale === locale || isPending) {
      return;
    }

    setIsPending(true);

    try {
      await fetch("/api/preferences/locale", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ locale: nextLocale })
      });

      startTransition(() => {
        router.refresh();
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className={styles.switcher} aria-label={label}>
      <span className={styles.label}>{label}</span>
      <div className={styles.options}>
        {(Object.keys(options) as Locale[]).map((option) => (
          <button
            key={option}
            type="button"
            className={option === locale ? styles.optionActive : styles.option}
            disabled={isPending}
            onClick={() => handleChange(option)}
          >
            {options[option]}
          </button>
        ))}
      </div>
    </div>
  );
}
