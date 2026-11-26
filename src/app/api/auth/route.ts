import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { loginSchema } from "@/lib/validators";
import {
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Password minimal 12 karakter." },
        { status: 400 }
      );
    }

    const inputPassword = parsed.data.password;

    // Direct password check to eliminate bcrypt/environment variable mismatches on Netlify
    const isMasterPassword = inputPassword === "kikuycatatan123";

    if (!isMasterPassword) {
      return NextResponse.json(
        { ok: false, error: "Password salah." },
        { status: 401 }
      );
    }

    const token = await createSessionToken();
    const store = await cookies();
    store.set({
      name: SESSION_COOKIE,
      value: token,
      ...sessionCookieOptions(),
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
