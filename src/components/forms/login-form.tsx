"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loginAction } from "@/server/actions/auth-actions";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await loginAction(formData);
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      router.replace("/");
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoFocus
          autoComplete="current-password"
          minLength={12}
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
