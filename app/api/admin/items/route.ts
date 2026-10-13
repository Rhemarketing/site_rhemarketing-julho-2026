import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getDbPool } from "@/lib/db";
import fs from "fs/promises";
import path from "path";

export async function GET(request: Request) {
  const session = await getAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const pool = getDbPool();
    const [rows] = await pool.query(
      "SELECT * FROM gallery_items ORDER BY sort_order DESC, id DESC"
    );
    return NextResponse.json({ items: rows });
  } catch (error) {
    console.error("Erro ao listar itens do admin:", error);
    return NextResponse.json(
      { error: "Erro ao buscar itens do banco de dados." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const type = formData.get("type") as "design" | "video";
    const title = ((formData.get("title") as string) || "").trim();
    const description = ((formData.get("description") as string) || "").trim() || null;
    const externalUrl = ((formData.get("external_url") as string) || "").trim() || null;
    const sortOrder = parseInt((formData.get("sort_order") as string) || "0", 10) || 0;

    const file = formData.get("file") as File | null;
    const thumbnailFile = formData.get("thumbnail") as File | null;

    if (!type || !["design", "video"].includes(type)) {
      return NextResponse.json(
        { error: "Tipo inválido. Deve ser 'design' ou 'video'." },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: "O título é obrigatório." },
        { status: 400 }
      );
    }

    // Para design, o arquivo é obrigatório. Para vídeo, precisa de arquivo OU externalUrl
    if (type === "design" && (!file || file.size === 0)) {
      return NextResponse.json(
        { error: "O arquivo da arte é obrigatório para Design Gráfico." },
        { status: 400 }
      );
    }

    if (type === "video" && (!file || file.size === 0) && !externalUrl) {
      return NextResponse.json(
        { error: "Envie um arquivo de vídeo ou informe um link de vídeo externo." },
        { status: 400 }
      );
    }

    let filePath = "";
    const uploadSubdir = type === "video" ? "videos" : "design";
    const uploadDir = path.join(process.cwd(), "public", "uploads", uploadSubdir);
    await fs.mkdir(uploadDir, { recursive: true });

    if (file && file.size > 0) {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uniqueFileName = `${Date.now()}_${cleanFileName}`;
      const absoluteTarget = path.join(uploadDir, uniqueFileName);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.writeFile(absoluteTarget, buffer);

      filePath = `/uploads/${uploadSubdir}/${uniqueFileName}`;
    } else if (externalUrl) {
      filePath = externalUrl;
    }

    let thumbnailPath: string | null = null;
    if (thumbnailFile && thumbnailFile.size > 0) {
      const cleanThumbName = thumbnailFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uniqueThumbName = `${Date.now()}_thumb_${cleanThumbName}`;
      const absoluteThumbTarget = path.join(uploadDir, uniqueThumbName);

      const arrayBuffer = await thumbnailFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.writeFile(absoluteThumbTarget, buffer);

      thumbnailPath = `/uploads/${uploadSubdir}/${uniqueThumbName}`;
    }

    const pool = getDbPool();
    const [result] = await pool.query(
      `INSERT INTO gallery_items 
        (type, title, description, file_path, thumbnail_path, external_url, sort_order) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [type, title, description, filePath, thumbnailPath, externalUrl, sortOrder]
    );

    const insertResult = result as { insertId: number };

    return NextResponse.json({
      success: true,
      item: {
        id: insertResult.insertId,
        type,
        title,
        description,
        file_path: filePath,
        thumbnail_path: thumbnailPath,
        external_url: externalUrl,
        sort_order: sortOrder,
      },
    });
  } catch (error) {
    console.error("Erro ao salvar item:", error);
    return NextResponse.json(
      { error: "Erro ao processar e salvar o item." },
      { status: 500 }
    );
  }
}
