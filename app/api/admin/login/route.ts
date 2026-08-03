import { NextResponse } from "next/server";
import { validateCredentials, createSession, setSessionCookie, verifySession } from "@/lib/auth";

export async function POST(request: Request) {
  const start = Date.now();
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const valid = validateCredentials(username, password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const token = createSession(username);
    await setSessionCookie(token);

    return NextResponse.json({ success: true, username, duration: Date.now() - start });
  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
