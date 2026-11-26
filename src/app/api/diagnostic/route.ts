import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  const rawHash = process.env.APP_PASSWORD_HASH;
  const dbUrl = process.env.DATABASE_URL;
  const authSecret = process.env.AUTH_SECRET;

  const testPass = "kikuycatatan123";
  let passMatches = false;
  let hashStatus = "missing";

  if (rawHash) {
    const unescaped = rawHash.replace(/\\(\$)/g, "$1");
    hashStatus = `set, length=${rawHash.length}, prefix=${rawHash.slice(0, 7)}`;
    try {
      passMatches = await bcrypt.compare(testPass, unescaped);
    } catch (e: unknown) {
      hashStatus += ` (compare error: ${e instanceof Error ? e.message : String(e)})`;
    }
  }

  let dbOk = false;
  let dbError = null;
  try {
    const count = await prisma.category.count();
    dbOk = true;
    dbError = `count=${count}`;
  } catch (e: unknown) {
    dbError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({
    status: "ok",
    hasAuthSecret: Boolean(authSecret),
    hasDbUrl: Boolean(dbUrl),
    dbHost: dbUrl ? dbUrl.split("@")[1]?.split("/")[0] : null,
    dbConnected: dbOk,
    dbInfo: dbError,
    hashStatus,
    kikuyPassMatches: passMatches,
  });
}
