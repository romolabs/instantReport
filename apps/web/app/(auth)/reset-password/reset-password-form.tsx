"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import type { AppDictionary, Locale } from "@/lib/i18n";

import styles from "../login/login.module.css";

interface ResetPasswordFormProps {
  locale: Locale;
  copy: AppDictionary["auth"]["resetPassword"];
  initialToken: string;
}

export function ResetPasswordForm({
  copy,
  initialToken
}: ResetPasswordFormProps) {
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const disabled =
    isSubmitting ||
    !token.trim() ||
    password.length < 8 ||
    confirmPassword.length < 8 ||
    password !== confirmPassword;

  const mismatch =
    confirmPassword.length > 0 && password !== confirmPassword
      ? copy.mismatch
      : null;

  const passwordHint = useMemo(() => {
    if (!password && !confirmPassword) {
      return copy.hintEmpty;
    }

    if (password.length < 8 || confirmPassword.length < 8) {
      return copy.hintShort;
    }

    return mismatch ?? copy.hintReady;
  }, [confirmPassword, copy.hintEmpty, copy.hintReady, copy.hintShort, mismatch, password]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token,
          newPassword: password
        })
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setError(payload?.message ?? copy.genericError);
        return;
      }

      setSuccess(payload?.message ?? copy.successDefault);
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError(copy.serverError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          <span>{copy.tokenLabel}</span>
          <input
            type="text"
            placeholder={copy.tokenPlaceholder}
            value={token}
            onChange={(event) => setToken(event.target.value)}
          />
        </label>

        <label>
          <span>{copy.passwordLabel}</span>
          <input
            type="password"
            placeholder={copy.passwordPlaceholder}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <label>
          <span>{copy.confirmLabel}</span>
          <input
            type="password"
            placeholder={copy.confirmPlaceholder}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </label>

        <p className={styles.helperNote}>{passwordHint}</p>

        {error ? <p className={styles.errorMessage}>{error}</p> : null}
        {success ? (
          <div className={styles.recoveryCard}>
            <p className={styles.recoveryLabel}>{copy.successLabel}</p>
            <p className={styles.recoveryMessage}>{success}</p>
            <Link href="/login" className={styles.secondaryLink}>
              {copy.successAction}
            </Link>
          </div>
        ) : null}

        <button type="submit" disabled={disabled}>
          {isSubmitting ? copy.submitting : copy.submit}
        </button>
      </form>
    </>
  );
}
