import { createRequire } from 'module';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

const require = createRequire('file:///c:/laragon/www/site_rhemarketing-julho-2026/package.json');
const mysql = require('mysql2/promise');

const API_KEY = process.env.CLOCKIFY_API_KEY;
const WORKSPACE_ID = process.env.CLOCKIFY_WORKSPACE_ID || '67c079a730305e27e57d1c4b'; // Espaço Vip

if (!API_KEY) {
  console.error("ERRO: A variável de ambiente CLOCKIFY_API_KEY não está configurada.");
  process.exit(1);
}
const BASE_URL = `https://api.clockify.me/api/v1/workspaces/${WORKSPACE_ID}`;

const STATE_FILE = path.resolve('C:/laragon/www/site_rhemarketing-julho-2026/scripts/clockify-sync-state.json');

const PROJECT_MAP = {
  'Rede London': '680640ece311197f34ecccc9',
  'Unigospel': '67c8be4b6bde8e6520db67b6',
  'Espaço Vip': '680640dbe20b814cf7c70866',
};
const DEFAULT_PROJECT_ID = '67c07ab5c2815c2660b4ba96'; // Gerais

function getProjectId(projectClient) {
  if (!projectClient) return DEFAULT_PROJECT_ID;
  const lower = projectClient.toLowerCase();
  for (const [key, id] of Object.entries(PROJECT_MAP)) {
    if (lower.includes(key.toLowerCase())) return id;
  }
  return DEFAULT_PROJECT_ID;
}

function loadState() {
  if (existsSync(STATE_FILE)) {
    try {
      return JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
    } catch (e) {
      console.error('Erro ao ler estado:', e);
    }
  }
  return { sentIds: [], lastUpdated: new Date().toISOString() };
}

function saveState(state) {
  state.lastUpdated = new Date().toISOString();
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

function toISO(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const [hh, mm, ss = '00'] = timeStr.split(':');
  return `${dateStr}T${hh.padStart(2, '0')}:${mm.padStart(2, '0')}:${ss.padStart(2, '0')}-03:00`;
}

function adjustEndDate(dateStr, startTime, endTime) {
  const [sh] = startTime.split(':').map(Number);
  const [eh] = endTime.split(':').map(Number);
  if (eh < sh) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }
  return dateStr;
}

async function main() {
  const state = loadState();

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("ERRO: A variável de ambiente DATABASE_URL não está configurada.");
    process.exit(1);
  }

  const conn = await mysql.createConnection({
    uri: dbUrl,
  });

  const [allRows] = await conn.execute(
    `SELECT id, entry_date, start_time, end_time, description, project_client
     FROM diario_bordo_entries 
     WHERE billable = 'Sim' 
     ORDER BY entry_date ASC, start_time ASC`
  );

  await conn.end();

  const remaining = allRows.filter(r => !state.sentIds.includes(r.id));
  console.log(`📋 Total de entradas: ${allRows.length}`);
  console.log(`✅ Já enviadas: ${state.sentIds.length}`);
  console.log(`📤 Restantes: ${remaining.length}`);

  // Limit to 27 requests in this run (since we already made 1 request at 16:40)
  const MAX_THIS_BATCH = 27;
  const batch = remaining.slice(0, MAX_THIS_BATCH);
  console.log(`⚡ Enviando lote de até ${batch.length} entradas agora...\n`);

  let successCount = 0;

  for (let i = 0; i < batch.length; i++) {
    const entry = batch[i];
    const dateStr = entry.entry_date instanceof Date
      ? entry.entry_date.toISOString().split('T')[0]
      : String(entry.entry_date).split('T')[0];

    const startTime = String(entry.start_time).substring(0, 5);
    const endTime = String(entry.end_time).substring(0, 5);
    const projectId = getProjectId(entry.project_client);
    const endDate = adjustEndDate(dateStr, startTime, endTime);
    const startISO = toISO(dateStr, startTime);
    const endISO = toISO(endDate, endTime);
    const projectName = Object.entries(PROJECT_MAP).find(([, id]) => id === projectId)?.[0] || 'Gerais';

    const body = {
      start: startISO,
      end: endISO,
      description: entry.description || '',
      projectId,
      billable: true,
    };

    const res = await fetch(`${BASE_URL}/time-entries`, {
      method: 'POST',
      headers: {
        'X-Api-Key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (res.status === 429) {
      console.log(`⚠️ Rate limit atingido prematuramente. Parando este lote.`);
      break;
    }

    if (!res.ok) {
      const errTxt = await res.text();
      console.error(`❌ Erro no envio do ID ${entry.id}: ${res.status} - ${errTxt.substring(0, 100)}`);
      continue;
    }

    state.sentIds.push(entry.id);
    saveState(state);
    successCount++;
    console.log(`✅ [${state.sentIds.length}/${allRows.length}] ID ${entry.id} | ${dateStr} ${startTime}-${endTime} | ${projectName} | ${(entry.description || '').substring(0, 45)}`);

    // 400ms delay between requests
    await new Promise(r => setTimeout(r, 400));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`🎉 Lote concluído!`);
  console.log(`Enviadas neste lote: ${successCount}`);
  console.log(`Total enviadas até agora: ${state.sentIds.length} de ${allRows.length}`);
  console.log(`Restam para o próximo ciclo: ${allRows.length - state.sentIds.length}`);
  console.log('='.repeat(60));
}

main().catch(err => {
  console.error('💥 Erro:', err);
  process.exit(1);
});
