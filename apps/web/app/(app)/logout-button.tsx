"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import styles from "./shell.module.css";

export function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setIsSubmitting(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST"
      });
    } finally {
      router.push("/login");
      router.refresh();
      setIsSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      className={styles.logoutButton}
      onClick={handleLogout}
      disabled={isSubmitting}
    >
      {isSubmitting ? "Signing out..." : "Sign out"}
    </button>
  );
}
