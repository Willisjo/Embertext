import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getSecret(): string {
  return process.env.ADMIN_SECRET_TOKEN || "";
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.createHmac("sha256", salt).update(password + getSecret()).digest("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (storedHash.includes(":")) {
    const [salt, hash] = storedHash.split(":");
    if (!salt || !hash) return false;
    const computed = crypto.createHmac("sha256", salt).update(password + getSecret()).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(computed));
  }

  const computed = crypto.createHmac("sha256", getSecret()).update(password).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(storedHash), Buffer.from(computed));
}

export function createSession(username: string): string {
  const payload = JSON.stringify({ username, exp: Date.now() + SESSION_MAX_AGE * 1000 });
  const payloadBase64 = Buffer.from(payload, "utf8").toString("base64url");
  const signature = crypto.createHmac("sha256", getSecret()).update(payloadBase64).digest("base64url");
  return `${payloadBase64}.${signature}`;
}

export function verifySession(token: string | undefined): { username: string } | null {
  if (!token) return null;
  try {
    const [payloadBase64, signature] = token.split(".");
    if (!payloadBase64 || !signature) return null;

    const expectedSignature = crypto.createHmac("sha256", getSecret()).update(payloadBase64).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadBase64, "base64url").toString("utf8"));
    if (payload.exp < Date.now()) return null;
    return { username: payload.username };
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySession(token);
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export function validateCredentials(username: string, password: string): boolean {
  const expectedUsername = process.env.ADMIN_USERNAME || "admin";
  const expectedPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedPasswordHash) return false;
  if (username !== expectedUsername) return false;
  return verifyPassword(password, expectedPasswordHash);
}
