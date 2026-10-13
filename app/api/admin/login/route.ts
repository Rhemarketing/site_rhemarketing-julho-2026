import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDbPool } from "@/lib/db";
import {
  createSessionToken,
  setAdminSessionCookie,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Usuário e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const pool = getDbPool();
    const [rows] = await pool.query(
      "SELECT id, username, password_hash FROM admin_users WHERE username = ? LIMIT 1",
      [username]
    );

    const users = rows as Array<{ id: number; username: string; password_hash: string }>;

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: "Credenciais inválidas." },
        { status: 401 }
      );
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Credenciais inválidas." },
        { status: 401 }
      );
    }

    const token = createSessionToken(user.username);
    try {
      await setAdminSessionCookie(token);
    } catch {}

    const response = NextResponse.json({
      success: true,
      user: { username: user.username },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error("Erro na rota de login admin:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao tentar autenticar." },
      { status: 500 }
    );
  }
}
