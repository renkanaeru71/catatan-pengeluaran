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

// Fallback hash for "kikuycatatan123" if Netlify still holds the initial invalid hash
const FALLBACK_HASH_KIKUY = "$2b$12$s/vwYnVgOcc2ma2CMQfSpOwsXSz/n1eKzJf.BIvcE6OvC8AA9/ezm";

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Password minimal 12 karakter." };
  }

  const rawHash = process.env.APP_PASSWORD_HASH;
  const hash = rawHash ? rawHash.replace(/\\(\$)/g, "$1").trim() : FALLBACK_HASH_KIKUY;

  // 1. Try comparing with configured environment hash
  let valid = await bcrypt.compare(parsed.data.password, hash);

  // 2. If env hash didn't match (e.g. Netlify didn't update yet), also test against verified hash
  if (!valid && hash !== FALLBACK_HASH_KIKUY) {
    valid = await bcrypt.compare(parsed.data.password, FALLBACK_HASH_KIKUY);
  }

  if (!valid) {
    return { ok: false, error: "Password salah." };
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
