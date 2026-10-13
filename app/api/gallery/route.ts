import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const pool = getDbPool();
    let query = "SELECT id, type, title, description, file_path, thumbnail_path, external_url, sort_order, created_at FROM gallery_items";
    const params: (string | number)[] = [];

    if (type && ["design", "video"].includes(type)) {
      query += " WHERE type = ?";
      params.push(type);
    }

    query += " ORDER BY sort_order DESC, id DESC";

    const [rows] = await pool.query(query, params);
    return NextResponse.json({ items: rows });
  } catch (error) {
    console.error("Erro na API pública de galeria:", error);
    return NextResponse.json(
      { error: "Erro ao buscar itens da galeria." },
      { status: 500 }
    );
  }
}
