"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import styles from "./login.module.css";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const disabled = useMemo(
    () => isSubmitting || !email.trim() || !password.trim(),
    [email, isSubmitting, password]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setError(payload?.message ?? "Unable to sign in.");
        return;
      }

      router.push("/tickets");
      router.refresh();
    } catch {
      setError("Unable to reach the server right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
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
      <label>
        <span>Password</span>
        <input
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      {error ? <p className={styles.errorMessage}>{error}</p> : null}

      <button type="submit" disabled={disabled}>
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
