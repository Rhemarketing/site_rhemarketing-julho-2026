import { createRequire } from 'module';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

const require = createRequire('file:///c:/laragon/www/site_rhemarketing-julho-2026/package.json');
const mysql = require('mysql2/promise');

const API_KEY = 'ZjIxZTBjZDYtN2E3NS00NDY5LThjOGUtNjQ4NTBhZTAwNDJh';
const WORKSPACE_ID = '67c079a730305e27e57d1c4b'; // Espaço Vip
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
  // Initial state with the 28 already sent
  return {
    sentIds: [
      1, 2, 3, 4, 10, 11, 13, 14,
      16, 17, 22, 23, 24, 25, 29, 33,
      36, 44, 45, 46, 53, 55, 57, 66,
      69, 70, 72, 73
    ],
    lastUpdated: new Date().toISOString()
  };
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

async function sendEntry(entry) {
  const dateStr = entry.entry_date instanceof Date
    ? entry.entry_date.toISOString().split('T')[0]
    : String(entry.entry_date).split('T')[0];

  const startTime = String(entry.start_time).substring(0, 5);
  const endTime = String(entry.end_time).substring(0, 5);
  const projectId = getProjectId(entry.project_client);
  const endDate = adjustEndDate(dateStr, startTime, endTime);
  const startISO = toISO(dateStr, startTime);
  const endISO = toISO(endDate, endTime);

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

  return { res, body, dateStr, startTime, endTime };
}

async function main() {
  console.log('🚀 Iniciando sincronizador automático Clockify...');
  const state = loadState();
  saveState(state); // Ensure state file exists

  const conn = await mysql.createConnection({
    host: '179.236.73.45',
    port: 3306,
    user: 'espacovip',
    password: 'R3nhc1b816nsv44ANrODZif8meIluP1M',
    database: 'espacovip',
  });

  const [allRows] = await conn.execute(
    `SELECT id, entry_date, start_time, end_time, description, project_client
     FROM diario_bordo_entries 
     WHERE billable = 'Sim' 
     ORDER BY entry_date ASC, start_time ASC`
  );

  await conn.end();

  console.log(`📋 Total de entradas faturáveis no banco: ${allRows.length}`);
  console.log(`✅ Já enviadas previamente: ${state.sentIds.length}`);

  let remaining = allRows.filter(r => !state.sentIds.includes(r.id));
  console.log(`📤 Pendentes de envio: ${remaining.length}`);

  if (remaining.length === 0) {
    console.log('🎉 Todas as entradas já foram enviadas!');
    return;
  }

  while (remaining.length > 0) {
    const entry = remaining[0];
    const { res, dateStr, startTime, endTime } = await sendEntry(entry);

    if (res.status === 429) {
      console.log(`[${new Date().toLocaleTimeString('pt-BR')}] ⏳ Rate limit atingido (limite de 30/hora da conta Free).`);
      console.log('   Aguardando 5 minutos antes de checar liberação do Clockify...');
      await new Promise(r => setTimeout(r, 5 * 60 * 1000));
      continue;
    }

    if (!res.ok) {
      const errTxt = await res.text();
      console.error(`❌ Erro no envio do ID ${entry.id} (${dateStr} ${startTime}-${endTime}): ${res.status} - ${errTxt}`);
      // If error is other than 429, mark it or wait a moment
      await new Promise(r => setTimeout(r, 5000));
      continue;
    }

    // Success!
    state.sentIds.push(entry.id);
    saveState(state);
    console.log(`✅ [${state.sentIds.length}/${allRows.length}] Enviado ID ${entry.id} | ${dateStr} ${startTime}-${endTime} | ${(entry.description || '').substring(0, 50)}`);

    remaining = allRows.filter(r => !state.sentIds.includes(r.id));

    if (remaining.length === 0) {
      console.log('\n🎉 TODAS AS ENTRADAS FORAM ENVIADAS COM SUCESSO AO CLOCKIFY!');
      break;
    }

    // Wait 500ms between normal requests
    await new Promise(r => setTimeout(r, 500));
  }
}

main().catch(err => {
  console.error('💥 Erro fatal:', err);
  process.exit(1);
});
