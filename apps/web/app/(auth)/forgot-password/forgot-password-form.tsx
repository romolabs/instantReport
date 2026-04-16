"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import {
  formatDateTime,
  interpolate,
  type AppDictionary,
  type Locale
} from "@/lib/i18n";

import styles from "../login/login.module.css";

interface ForgotPasswordPayload {
  message?: string;
  resetToken?: string;
  expiresAt?: string;
}

interface ForgotPasswordFormProps {
  locale: Locale;
  copy: AppDictionary["auth"]["forgotPassword"];
}

export function ForgotPasswordForm({
  locale,
  copy
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ForgotPasswordPayload | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const disabled = useMemo(
    () => isSubmitting || !email.trim(),
    [email, isSubmitting]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const payload = (await response.json().catch(() => null)) as
        | ForgotPasswordPayload
        | null;

      if (!response.ok) {
        setError(payload?.message ?? copy.genericError);
        return;
      }

      setResult(payload ?? { message: copy.defaultMessage });
    } catch {
      setError(copy.serverError);
    } finally {
      setIsSubmitting(false);
    }
  }

  const expiresAtLabel = result?.expiresAt
    ? formatDateTime(locale, result.expiresAt)
    : null;

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          <span>{copy.emailLabel}</span>
          <input
            type="email"
            placeholder={copy.emailPlaceholder}
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        {error ? <p className={styles.errorMessage}>{error}</p> : null}

        <button type="submit" disabled={disabled}>
          {isSubmitting ? copy.submitting : copy.submit}
        </button>
      </form>

      {result ? (
        <div className={styles.recoveryCard}>
          <p className={styles.recoveryLabel}>{copy.statusLabel}</p>
          <p className={styles.recoveryMessage}>
            {result.message ?? copy.defaultMessage}
          </p>

          {result.resetToken ? (
            <>
              <div className={styles.tokenBlock}>
                <span>{copy.tokenLabel}</span>
                <code>{result.resetToken}</code>
              </div>

              {expiresAtLabel ? (
                <p className={styles.recoveryMeta}>
                  {interpolate(copy.expiresLabel, { date: expiresAtLabel })}
                </p>
              ) : null}

              <Link
                href={`/reset-password?token=${encodeURIComponent(result.resetToken)}`}
                className={styles.secondaryLink}
              >
                {copy.continueLabel}
              </Link>
            </>
          ) : (
            <p className={styles.recoveryMeta}>{copy.localOnlyNote}</p>
          )}
        </div>
      ) : null}
    </>
  );
}
