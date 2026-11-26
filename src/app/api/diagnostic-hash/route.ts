import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  const rawHash = process.env.APP_PASSWORD_HASH || "";
  const unescaped = rawHash.replace(/\\(\$)/g, "$1");

  const dictionary = [
    "catatan123456",
    "kikuycatatan123",
    "catatanpengeluaran123",
    "catatanpengeluaran",
    "password123456",
    "admin12345678",
    "catatan-pengeluaran",
    "kikuy12345678",
    "renkanaeru7112",
  ];

  let matchedWord = null;
  for (const word of dictionary) {
    if (await bcrypt.compare(word, unescaped)) {
      matchedWord = word;
      break;
    }
  }

  // Generate what the hash of kikuycatatan123 should be:
  const expectedHash = await bcrypt.hash("kikuycatatan123", 12);

  return NextResponse.json({
    rawLength: rawHash.length,
    rawPrefix: rawHash.slice(0, 10),
    rawSuffix: rawHash.slice(-6),
    matchedWord,
    expectedHashForKikuy: expectedHash,
  });
}
