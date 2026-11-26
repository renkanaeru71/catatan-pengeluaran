"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validators";
import {
  createSessionToken,
  getSession,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Guard for every Server Action. Redirects to /login when unauthenticated. */
export async function requireSession(): Promise<void> {
  if (!(await getSession())) {
    redirect("/login");
  }
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Password minimal 12 karakter." };
  }

  const rawHash = process.env.APP_PASSWORD_HASH;
  if (!rawHash) {
    return {
      ok: false,
      error: "APP_PASSWORD_HASH belum terbaca di Netlify runtime.",
    };
  }

  // Handle both escaped (\$2b\$) and unescaped ($2b$) bcrypt prefixes from .env
  const hash = rawHash.replace(/\\(\$)/g, "$1").trim();

  const valid = await bcrypt.compare(parsed.data.password, hash);
  if (!valid) {
    return { ok: false, error: `Password salah (hash length: ${hash.length}, prefix: ${hash.slice(0, 7)}).` };
  }

  const token = await createSessionToken();
  const store = await cookies();
  store.set({
    name: SESSION_COOKIE,
    value: token,
    ...sessionCookieOptions(),
  });

  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
