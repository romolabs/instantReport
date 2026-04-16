"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import styles from "../login/login.module.css";

interface ForgotPasswordPayload {
  message?: string;
  resetToken?: string;
  expiresAt?: string;
}

function formatExpiresAt(value?: string) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function ForgotPasswordForm() {
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
        setError(payload?.message ?? "Unable to start password recovery.");
        return;
      }

      setResult(payload ?? { message: "Reset request created." });
    } catch {
      setError("Unable to reach the server right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const expiresAtLabel = formatExpiresAt(result?.expiresAt);

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          <span>Email</span>
          <input
            type="email"
            placeholder="name@company.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        {error ? <p className={styles.errorMessage}>{error}</p> : null}

        <button type="submit" disabled={disabled}>
          {isSubmitting ? "Generating token..." : "Request reset"}
        </button>
      </form>

      {result ? (
        <div className={styles.recoveryCard}>
          <p className={styles.recoveryLabel}>Recovery status</p>
          <p className={styles.recoveryMessage}>
            {result.message ??
              "If the account exists, a password reset token was generated."}
          </p>

          {result.resetToken ? (
            <>
              <div className={styles.tokenBlock}>
                <span>Reset token</span>
                <code>{result.resetToken}</code>
              </div>

              {expiresAtLabel ? (
                <p className={styles.recoveryMeta}>Expires {expiresAtLabel}</p>
              ) : null}

              <Link
                href={`/reset-password?token=${encodeURIComponent(result.resetToken)}`}
                className={styles.secondaryLink}
              >
                Continue to reset password
              </Link>
            </>
          ) : (
            <p className={styles.recoveryMeta}>
              Once email delivery is wired, the token will leave the API
              response and arrive out-of-band instead.
            </p>
          )}
        </div>
      ) : null}
    </>
  );
}
