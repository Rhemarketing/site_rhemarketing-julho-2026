import { cookies, headers } from "next/headers";
import crypto from "crypto";

export const SESSION_COOKIE_NAME = "pm_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias em segundos

export interface SessionData {
  username: string;
  exp: number;
}

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.trim().length === 0) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "ERRO DE SEGURANÇA: A variável de ambiente ADMIN_SESSION_SECRET não está configurada."
      );
    }
    // Fallback apenas para desenvolvimento local se não configurado
    return "dev_secret_local_only_rhemarketing_2026_insecure";
  }
  return secret;
}

function signPayload(dataString: string): string {
  return crypto
    .createHmac("sha256", getSessionSecret())
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
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [payloadB64, signature] = parts;

    const expectedSignature = signPayload(payloadB64);
    
    // Comparação de tempo constante (timing-safe) para evitar timing attacks
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (
      sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return null;
    }

    const decoded = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8")
    ) as SessionData & { ixp?: number };

    const exp = decoded.exp || decoded.ixp || 0;
    const now = Math.floor(Date.now() / 1000);
    if (exp && exp < now) return null;

    return {
      username: decoded.username,
      exp: exp || now + SESSION_MAX_AGE,
    };
  } catch {
    return null;
  }
}

export async function getAdminSession(request?: Request): Promise<SessionData | null> {
  const candidateTokens: string[] = [];

  const extractTokens = (headerStr: string) => {
    if (!headerStr) return;
    const regex = new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`, "g");
    let match: RegExpExecArray | null;
    while ((match = regex.exec(headerStr)) !== null) {
      candidateTokens.push(decodeURIComponent(match[1].trim()));
    }
  };

  // 1. Tentar ler diretamente do header Cookie da requisição
  if (request) {
    extractTokens(request.headers.get("cookie") || "");
  }

  // 2. Tentar ler do headers() do Next.js
  try {
    const reqHeaders = await headers();
    extractTokens(reqHeaders.get("cookie") || "");
  } catch {}

  // 3. Tentar ler do cookieStore
  try {
    const cookieStore = await cookies();
    const all = cookieStore.getAll(SESSION_COOKIE_NAME);
    for (const c of all) {
      if (c.value) candidateTokens.push(c.value);
    }
    const single = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (single) candidateTokens.push(single);
  } catch {}

  // Testar todos os tokens candidatos em ordem inversa (mais recente primeiro)
  for (let i = candidateTokens.length - 1; i >= 0; i--) {
    const token = candidateTokens[i];
    const session = verifySessionToken(token);
    if (session) return session;
  }

  return null;
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
