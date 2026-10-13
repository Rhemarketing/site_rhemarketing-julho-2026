import { cookies, headers } from "next/headers";
import crypto from "crypto";

export const SESSION_COOKIE_NAME = "pm_admin_session";
const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  "pm_sec_9874fg23908fwe089f23kjnf09823f-rhe-2026";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias em segundos

interface SessionData {
  username: string;
  exp: number;
}

function signPayload(dataString: string): string {
  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(dataString)
    .digest("hex");
}

export function createSessionToken(username: string): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const payload: SessionData = { username, exp };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signPayload(payloadB64);
  return `${payloadB64}.${signature}`;
}

export function verifySessionToken(token: string): SessionData | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payloadB64, signature] = parts;

    const expectedSignature = signPayload(payloadB64);
    if (signature !== expectedSignature) return null;

    const decoded = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8")
    ) as SessionData;

    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) return null;

    return decoded;
  } catch {
    return null;
  }
}

export async function getAdminSession(request?: Request): Promise<SessionData | null> {
  let cookieVal: string | undefined;

  // 1. Tentar ler diretamente do header Cookie da requisição
  if (request) {
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(
      new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`)
    );
    if (match) cookieVal = match[1];
  }

  // 2. Tentar ler do headers() do Next.js
  if (!cookieVal) {
    try {
      const reqHeaders = await headers();
      const cookieHeader = reqHeaders.get("cookie") || "";
      const match = cookieHeader.match(
        new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`)
      );
      if (match) cookieVal = match[1];
    } catch {}
  }

  // 3. Tentar ler do cookieStore
  if (!cookieVal) {
    try {
      const cookieStore = await cookies();
      cookieVal = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    } catch {}
  }

  if (!cookieVal) return null;
  return verifySessionToken(cookieVal);
}

export async function setAdminSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
