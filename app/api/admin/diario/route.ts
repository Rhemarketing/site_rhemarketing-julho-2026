import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getDbPool } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date"); // YYYY-MM-DD
    const pool = getDbPool();

    // 1. Obter todas as datas disponíveis
    const [datesRows] = await pool.query(`
      SELECT 
        DATE_FORMAT(entry_date, '%Y-%m-%d') as entry_date, 
        COUNT(*) as total_entries,
        SUM(CASE WHEN billable = 'Sim' THEN 1 ELSE 0 END) as billable_entries
      FROM diario_bordo_entries 
      GROUP BY entry_date 
      ORDER BY entry_date DESC
    `);
    const availableDates = datesRows as Array<{
      entry_date: string;
      total_entries: number;
      billable_entries: number;
    }>;

    // Determinar a data a carregar (data passada ou a mais recente)
    const selectedDate = dateParam || availableDates[0]?.entry_date || null;

    let entries: any[] = [];
    if (selectedDate) {
      const [entriesRows] = await pool.query(
        `SELECT 
          id, 
          DATE_FORMAT(entry_date, '%Y-%m-%d') as entry_date, 
          start_time, 
          end_time, 
          duration, 
          category, 
          project_client, 
          context_location, 
          description, 
          billable, 
          created_at, 
          updated_at 
        FROM diario_bordo_entries 
        WHERE entry_date = ? 
        ORDER BY start_time ASC, id ASC`,
        [selectedDate]
      );
      entries = entriesRows as any[];
    }

    // Obter listas de sugestões para categorias, clientes e contextos
    const [categoriesRows] = await pool.query(
      `SELECT DISTINCT category FROM diario_bordo_entries WHERE category IS NOT NULL AND category != '' ORDER BY category ASC`
    );
    const [clientsRows] = await pool.query(
      `SELECT DISTINCT project_client FROM diario_bordo_entries WHERE project_client IS NOT NULL AND project_client != '' ORDER BY project_client ASC`
    );
    const [locationsRows] = await pool.query(
      `SELECT DISTINCT context_location FROM diario_bordo_entries WHERE context_location IS NOT NULL AND context_location != '' ORDER BY context_location ASC`
    );

    return NextResponse.json({
      success: true,
      selectedDate,
      availableDates,
      entries,
      suggestions: {
        categories: (categoriesRows as any[]).map((r) => r.category),
        clients: (clientsRows as any[]).map((r) => r.project_client),
        locations: (locationsRows as any[]).map((r) => r.context_location),
      },
    });
  } catch (error) {
    console.error("Erro na rota GET /api/admin/diario:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao carregar diário de bordo." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession(request);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { date, upsert, deleteIds } = body as {
      date?: string;
      upsert?: Array<{
        id?: number;
        entry_date: string;
        start_time: string;
        end_time: string;
        duration?: string;
        category: string;
        project_client: string;
        context_location: string;
        description: string;
        billable: "Sim" | "Não";
      }>;
      deleteIds?: number[];
    };

    const pool = getDbPool();

    // 1. Processar exclusões
    if (Array.isArray(deleteIds) && deleteIds.length > 0) {
      const validIds = deleteIds.filter((id) => typeof id === "number" && id > 0);
      if (validIds.length > 0) {
        const placeholders = validIds.map(() => "?").join(",");
        await pool.query(
          `DELETE FROM diario_bordo_entries WHERE id IN (${placeholders})`,
          validIds
        );
      }
    }

    // 2. Processar inserções e atualizações (upsert)
    if (Array.isArray(upsert) && upsert.length > 0) {
      for (const item of upsert) {
        // Cálculo de duração se não fornecido
        let duration = item.duration;
        if (!duration || duration.trim() === "") {
          try {
            const [sH, sM] = item.start_time.split(":").map(Number);
            const [eH, eM] = item.end_time.split(":").map(Number);
            let diff = eH * 60 + eM - (sH * 60 + sM);
            if (diff < 0) diff += 24 * 60;
            const h = Math.floor(diff / 60);
            const m = diff % 60;
            duration = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
          } catch {
            duration = "00:00:00";
          }
        }

        if (item.id && item.id > 0) {
          // Atualização
          await pool.query(
            `UPDATE diario_bordo_entries 
             SET entry_date = ?, start_time = ?, end_time = ?, duration = ?, 
                 category = ?, project_client = ?, context_location = ?, 
                 description = ?, billable = ?
             WHERE id = ?`,
            [
              item.entry_date,
              item.start_time,
              item.end_time,
              duration,
              item.category || "Outros",
              item.project_client || "Geral",
              item.context_location || "Geral",
              item.description || "",
              item.billable === "Sim" ? "Sim" : "Não",
              item.id,
            ]
          );
        } else {
          // Inserção
          await pool.query(
            `INSERT INTO diario_bordo_entries 
              (entry_date, start_time, end_time, duration, category, project_client, context_location, description, billable)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              item.entry_date,
              item.start_time,
              item.end_time,
              duration,
              item.category || "Outros",
              item.project_client || "Geral",
              item.context_location || "Geral",
              item.description || "",
              item.billable === "Sim" ? "Sim" : "Não",
            ]
          );
        }
      }
    }

    // 3. Buscar os registros atualizados para a data solicitada
    const targetDate = date || (upsert && upsert[0]?.entry_date);
    let updatedEntries: any[] = [];
    if (targetDate) {
      const [entriesRows] = await pool.query(
        `SELECT 
          id, 
          DATE_FORMAT(entry_date, '%Y-%m-%d') as entry_date, 
          start_time, 
          end_time, 
          duration, 
          category, 
          project_client, 
          context_location, 
          description, 
          billable, 
          created_at, 
          updated_at 
        FROM diario_bordo_entries 
        WHERE entry_date = ? 
        ORDER BY start_time ASC, id ASC`,
        [targetDate]
      );
      updatedEntries = entriesRows as any[];
    }

    // 4. Atualizar lista de datas
    const [datesRows] = await pool.query(`
      SELECT 
        DATE_FORMAT(entry_date, '%Y-%m-%d') as entry_date, 
        COUNT(*) as total_entries,
        SUM(CASE WHEN billable = 'Sim' THEN 1 ELSE 0 END) as billable_entries
      FROM diario_bordo_entries 
      GROUP BY entry_date 
      ORDER BY entry_date DESC
    `);

    return NextResponse.json({
      success: true,
      message: "Alterações salvas com sucesso no banco de dados!",
      entries: updatedEntries,
      availableDates: datesRows,
    });
  } catch (error) {
    console.error("Erro na rota POST /api/admin/diario:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao salvar alterações do diário." },
      { status: 500 }
    );
  }
}
