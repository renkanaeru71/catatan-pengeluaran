import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session-token";

export {
  createSessionToken,
  verifySessionToken,
  sessionCookieOptions,
  SESSION_COOKIE,
} from "@/lib/session-token";

/** Read and verify the session cookie from the current request (server-side only). */
export async function getSession(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}
