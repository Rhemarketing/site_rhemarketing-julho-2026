import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getDbPool } from "@/lib/db";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const ALLOWED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const ALLOWED_VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov"]);

const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

function getSafeFileExtension(filename: string): string {
  const ext = path.extname(filename || "").toLowerCase();
  return ext;
}

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
      const ext = getSafeFileExtension(file.name);
      const isVideo = type === "video";
      const allowedSet = isVideo ? ALLOWED_VIDEO_EXTENSIONS : ALLOWED_IMAGE_EXTENSIONS;
      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

      if (!allowedSet.has(ext)) {
        return NextResponse.json(
          {
            error: `Extensão '${ext}' não permitida para ${
              isVideo ? "vídeo" : "imagem"
            }. Formatos válidos: ${Array.from(allowedSet).join(", ")}`,
          },
          { status: 400 }
        );
      }

      if (file.size > maxSize) {
        return NextResponse.json(
          {
            error: `Arquivo excede o limite máximo permitido de ${
              maxSize / (1024 * 1024)
            }MB.`,
          },
          { status: 400 }
        );
      }

      // Nome do arquivo seguro com hash aleatório para evitar colisões e path traversal
      const safeRandomName = `${Date.now()}_${crypto.randomBytes(12).toString("hex")}${ext}`;
      const absoluteTarget = path.join(uploadDir, safeRandomName);

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.writeFile(absoluteTarget, buffer);

      filePath = `/uploads/${uploadSubdir}/${safeRandomName}`;
    } else if (externalUrl) {
      filePath = externalUrl;
    }

    let thumbnailPath: string | null = null;
    if (thumbnailFile && thumbnailFile.size > 0) {
      const thumbExt = getSafeFileExtension(thumbnailFile.name);
      if (!ALLOWED_IMAGE_EXTENSIONS.has(thumbExt)) {
        return NextResponse.json(
          {
            error: `Extensão de miniatura '${thumbExt}' não permitida. Formatos válidos: ${Array.from(
              ALLOWED_IMAGE_EXTENSIONS
            ).join(", ")}`,
          },
          { status: 400 }
        );
      }

      if (thumbnailFile.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          {
            error: `Miniatura excede o limite máximo permitido de ${
              MAX_IMAGE_SIZE / (1024 * 1024)
            }MB.`,
          },
          { status: 400 }
        );
      }

      const safeThumbName = `${Date.now()}_thumb_${crypto.randomBytes(12).toString("hex")}${thumbExt}`;
      const absoluteThumbTarget = path.join(uploadDir, safeThumbName);

      const arrayBuffer = await thumbnailFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.writeFile(absoluteThumbTarget, buffer);

      thumbnailPath = `/uploads/${uploadSubdir}/${safeThumbName}`;
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
