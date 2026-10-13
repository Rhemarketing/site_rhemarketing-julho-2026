import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getDbPool } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const itemId = parseInt(id, 10);
  if (!itemId) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  try {
    const pool = getDbPool();
    const [rows] = await pool.query(
      "SELECT id, file_path, thumbnail_path FROM gallery_items WHERE id = ? LIMIT 1",
      [itemId]
    );

    const items = rows as Array<{
      id: number;
      file_path: string;
      thumbnail_path: string | null;
    }>;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Item não encontrado." },
        { status: 404 }
      );
    }

    const item = items[0];

    // Excluir do banco
    await pool.query("DELETE FROM gallery_items WHERE id = ?", [itemId]);

    // Tentar remover arquivos do disco se forem locais
    const safeDeleteFile = async (publicPath: string | null) => {
      if (!publicPath || !publicPath.startsWith("/uploads/")) return;
      try {
        const fullPath = path.join(process.cwd(), "public", publicPath);
        await fs.unlink(fullPath);
      } catch {
        // Ignorar se o arquivo já não existir
      }
    };

    await safeDeleteFile(item.file_path);
    await safeDeleteFile(item.thumbnail_path);

    return NextResponse.json({
      success: true,
      message: "Item excluído com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao excluir item:", error);
    return NextResponse.json(
      { error: "Erro ao excluir o item do banco de dados." },
      { status: 500 }
    );
  }
}
