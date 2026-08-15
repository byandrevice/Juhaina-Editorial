"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldLabel, Input } from "@/components/ui/field";

export function AdminSignIn({
  configured,
  demo,
}: {
  configured: boolean;
  demo: boolean;
}) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  if (demo) {
    return (
      <div className="admin-setup-note">
        <strong>Local preview mode</strong>
        <p>Supabase is not connected yet. The editor works locally and keeps recovery drafts in this browser.</p>
        <Button type="button" onClick={() => window.location.assign("/admin")}>
          Open local admin
        </Button>
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="admin-setup-note" role="status">
        Add the Supabase project URL and publishable key to activate sign-in.
      </div>
    );
  }

  async function requestMagicLink(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const response = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const result = await response.json();
    setMessage(result.message ?? (response.ok ? "Check your email for a secure sign-in link." : "Sign-in is temporarily unavailable."));
    setBusy(false);
  }

  return (
    <form className="admin-sign-in__form" onSubmit={requestMagicLink}>
      <FieldLabel htmlFor="admin-email">Email address</FieldLabel>
      <Input
        id="admin-email"
        type="email"
        autoComplete="email"
        value={email}
        required
        onChange={(event) => setEmail(event.target.value)}
      />
      <Button disabled={busy}>{busy ? "Sending link…" : "Email me a sign-in link"}</Button>
      {message ? <p className="admin-form-message" aria-live="polite">{message}</p> : null}
    </form>
  );
}
