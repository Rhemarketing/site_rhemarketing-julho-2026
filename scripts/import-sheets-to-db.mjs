import mysql from "mysql2/promise";
import { execSync } from "child_process";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("ERRO: A variável de ambiente DATABASE_URL não está configurada.");
  process.exit(1);
}

const SPREADSHEET_ID = "1oz8HN_pzC6vgQsiOaHZ0sIfTpExWMEbZasJbiFYm_gg";

function parseCorrectDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.trim().split("/");
  if (parts.length !== 3) return null;

  const p1 = parseInt(parts[0], 10);
  const p2 = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  // Se p1 > 12 -> inequivocamente DD/MM/YYYY (ex: 28/09, 30/09, 13/10...30/10)
  if (p1 > 12) {
    return `${year}-${String(p2).padStart(2, "0")}-${String(p1).padStart(2, "0")}`;
  }

  // Se p1 === 10 e p2 < 10 (ex: 10/01/2026 até 10/09/2026) -> MM/DD/YYYY (Outubro dia 1 a 9)
  if (p1 === 10 && p2 >= 1 && p2 <= 9) {
    return `${year}-${String(p1).padStart(2, "0")}-${String(p2).padStart(2, "0")}`;
  }

  // 12/10/2026 -> É dia 12 de Outubro (DD/MM/YYYY), após o fim de semana 10-11/10
  if (p1 === 12 && p2 === 10) {
    return `${year}-10-12`;
  }

  // Fallback padrão DD/MM/YYYY
  return `${year}-${String(p2).padStart(2, "0")}-${String(p1).padStart(2, "0")}`;
}

function normalizeTime(timeStr) {
  if (!timeStr) return "00:00";
  const trimmed = timeStr.trim();
  const parts = trimmed.split(":");
  if (parts.length >= 2) {
    const h = String(parts[0]).padStart(2, "0");
    const m = String(parts[1]).padStart(2, "0");
    return `${h}:${m}`;
  }
  return trimmed;
}

function normalizeDuration(durStr, start, end) {
  if (durStr && durStr.trim().length > 0) {
    const parts = durStr.trim().split(":");
    if (parts.length >= 2) {
      const h = parseInt(parts[0], 10) || 0;
      const m = parseInt(parts[1], 10) || 0;
      const s = parts[2] ? parseInt(parts[2], 10) || 0 : 0;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return durStr.trim();
  }

  // Se não tiver duração, calcula a partir de start e end
  try {
    const [sH, sM] = start.split(":").map(Number);
    const [eH, eM] = end.split(":").map(Number);
    let diffMins = eH * 60 + eM - (sH * 60 + sM);
    if (diffMins < 0) diffMins += 24 * 60; // cruza meia-noite
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
  } catch {
    return "00:00:00";
  }
}

async function main() {
  console.log("Conectando ao banco de dados...");
  const connection = await mysql.createConnection({
    uri: DATABASE_URL,
    ssl: false,
  });

  console.log("Conexão bem sucedida. Criando tabela diario_bordo_entries...");
  await connection.query(`
    CREATE TABLE IF NOT EXISTS diario_bordo_entries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      entry_date DATE NOT NULL,
      start_time VARCHAR(10) NOT NULL,
      end_time VARCHAR(10) NOT NULL,
      duration VARCHAR(20) NOT NULL,
      category VARCHAR(100) NOT NULL,
      project_client VARCHAR(150) NOT NULL,
      context_location VARCHAR(150) NOT NULL,
      description TEXT NOT NULL,
      billable ENUM('Sim', 'Não') NOT NULL DEFAULT 'Não',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_date (entry_date),
      INDEX idx_category (category),
      INDEX idx_client (project_client)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log("Lendo registros da planilha Google Sheets via CLI...");
  const cmd = `gsheets readonly read ${SPREADSHEET_ID} "'Diário de Bordo'!A1:I300"`;
  const raw = execSync(cmd, { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 });

  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  console.log(`Lidas ${lines.length} linhas (incluindo cabeçalho).`);

  // Verificar se já há registros
  const [existing] = await connection.query("SELECT COUNT(*) as count FROM diario_bordo_entries");
  const count = existing[0]?.count || 0;
  console.log(`Registros atualmente no banco: ${count}`);

  if (count > 0) {
    console.log("Limpando registros antigos para re-importação limpa e normalizada...");
    await connection.query("TRUNCATE TABLE diario_bordo_entries");
  }

  console.log("Normalizando e inserindo registros...");
  let inserted = 0;

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split("\t");
    const rawDate = parts[0]?.trim();
    if (!rawDate) continue;

    const entry_date = parseCorrectDate(rawDate);
    const start_time = normalizeTime(parts[1]);
    const end_time = normalizeTime(parts[2]);
    const duration = normalizeDuration(parts[3], start_time, end_time);
    const category = parts[4]?.trim() || "Outros";
    const project_client = parts[5]?.trim() || "Geral";
    const context_location = parts[6]?.trim() || "Geral";
    const description = parts[7]?.trim() || "";
    const billable = parts[8]?.trim() === "Sim" ? "Sim" : "Não";

    await connection.query(
      `INSERT INTO diario_bordo_entries 
        (entry_date, start_time, end_time, duration, category, project_client, context_location, description, billable)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entry_date,
        start_time,
        end_time,
        duration,
        category,
        project_client,
        context_location,
        description,
        billable,
      ]
    );
    inserted++;
  }

  console.log(`Sucesso! ${inserted} registros importados com datas e horários normalizados.`);

  // Conferência dos dias importados
  const [summary] = await connection.query(`
    SELECT entry_date, COUNT(*) as total_entries, 
           SUM(CASE WHEN billable = 'Sim' THEN 1 ELSE 0 END) as billable_entries
    FROM diario_bordo_entries 
    GROUP BY entry_date 
    ORDER BY entry_date ASC
  `);

  console.log("\nResumo por dia no banco de dados:");
  console.table(summary);

  await connection.end();
}

main().catch((err) => {
  console.error("Erro durante importação:", err);
  process.exit(1);
});
