"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password.length < 12) {
      setError("Password minimal 12 karakter.");
      return;
    }

    setError(null);
    setIsPending(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await res.json();
      if (!result.ok) {
        setError(result.error || "Password salah.");
        toast.error(result.error || "Password salah.");
        setIsPending(false);
        return;
      }
      window.location.replace("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghubungi server";
      setError(msg);
      toast.error(msg);
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoFocus
          autoComplete="current-password"
          minLength={12}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aria-describedby={error ? "login-error" : undefined}
          aria-invalid={error ? true : undefined}
          disabled={isPending}
        />
      </div>

      {error && (
        <p id="login-error" role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Memeriksa..." : "Masuk"}
      </Button>
    </form>
  );
}
