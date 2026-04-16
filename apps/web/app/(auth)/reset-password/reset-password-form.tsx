"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import styles from "../login/login.module.css";

interface ResetPasswordFormProps {
  initialToken: string;
}

export function ResetPasswordForm({ initialToken }: ResetPasswordFormProps) {
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
      ? "Passwords must match."
      : null;

  const passwordHint = useMemo(() => {
    if (!password && !confirmPassword) {
      return "Use at least 8 characters.";
    }

    if (password.length < 8 || confirmPassword.length < 8) {
      return "The new password must be at least 8 characters.";
    }

    return mismatch ?? "The new password is ready to submit.";
  }, [confirmPassword, mismatch, password]);

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
        setError(payload?.message ?? "Unable to reset the password.");
        return;
      }

      setSuccess(payload?.message ?? "Password updated successfully.");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Unable to reach the server right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          <span>Reset token</span>
          <input
            type="text"
            placeholder="Paste the token from the recovery step"
            value={token}
            onChange={(event) => setToken(event.target.value)}
          />
        </label>

        <label>
          <span>New password</span>
          <input
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        <label>
          <span>Confirm password</span>
          <input
            type="password"
            placeholder="Repeat the new password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </label>

        <p className={styles.helperNote}>{passwordHint}</p>

        {error ? <p className={styles.errorMessage}>{error}</p> : null}
        {success ? (
          <div className={styles.recoveryCard}>
            <p className={styles.recoveryLabel}>Password updated</p>
            <p className={styles.recoveryMessage}>{success}</p>
            <Link href="/login" className={styles.secondaryLink}>
              Return to sign in
            </Link>
          </div>
        ) : null}

        <button type="submit" disabled={disabled}>
          {isSubmitting ? "Updating password..." : "Reset password"}
        </button>
      </form>
    </>
  );
}
