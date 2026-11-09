import mysql from "mysql2/promise";
import fs from "fs";

const DATABASE_URL = "mariadb://espacovip:R3nhc1b816nsv44ANrODZif8meIluP1M@179.236.73.45:3306/espacovip";
const SPREADSHEET_ID = "1oz8HN_pzC6vgQsiOaHZ0sIfTpExWMEbZasJbiFYm_gg";

const entries = [
  // 02/11/2026 (Segunda-feira)
  {
    row: 203,
    dateSheets: "02/11/2026",
    dateDb: "2026-11-02",
    start: "11:30",
    end: "13:20",
    duration: "01:50:00",
    category: "Produtividade / Gestão",
    client: "Pessoal / Antigravity",
    context: "Espaço Vip",
    desc: "Sessão de trabalho e desenvolvimento com Antigravity CLI; organização, limpeza e sincronização de contatos ministeriais no Google Contacts e WhatsApp Web.",
    billable: "Não"
  },
  {
    row: 204,
    dateSheets: "02/11/2026",
    dateDb: "2026-11-02",
    start: "13:20",
    end: "13:40",
    duration: "00:20:00",
    category: "Triagem de E-mails",
    client: "Rhemarketing",
    context: "Espaço Vip",
    desc: "Triagem e resolução de pendências nos e-mails corporativos e alertas operacionais no Gmail (rhemarketando@gmail.com).",
    billable: "Sim"
  },
  {
    row: 205,
    dateSheets: "02/11/2026",
    dateDb: "2026-11-02",
    start: "13:40",
    end: "14:30",
    duration: "00:50:00",
    category: "Trabalho",
    client: "Unigospel",
    context: "Espaço Vip",
    desc: "[Unigospel / Automações] Correção de atrasos acumulados e padronização do fuso horário UTC no agendamento de mensagens automáticas de WhatsApp (commit 75257f1).",
    billable: "Sim"
  },
  {
    row: 206,
    dateSheets: "02/11/2026",
    dateDb: "2026-11-02",
    start: "14:30",
    end: "15:15",
    duration: "00:45:00",
    category: "Tráfego Pago",
    client: "Rhemarketing / Sempre Bella",
    context: "Espaço Vip",
    desc: "[Tráfego Pago] Auditoria de campanhas, conjuntos de anúncios e contas no Meta Business Suite e Gerenciador de Anúncios para Sempre Bella e SOS Celulares.",
    billable: "Sim"
  },
  {
    row: 207,
    dateSheets: "02/11/2026",
    dateDb: "2026-11-02",
    start: "15:15",
    end: "19:30",
    duration: "04:15:00",
    category: "Almoço / Descanso",
    client: "Pessoal",
    context: "Casa / Pessoal",
    desc: "Intervalo de almoço, descanso e rotina pessoal do feriado de Finados.",
    billable: "Não"
  },
  {
    row: 208,
    dateSheets: "02/11/2026",
    dateDb: "2026-11-02",
    start: "19:30",
    end: "20:00",
    duration: "00:30:00",
    category: "Trabalho",
    client: "Unigospel & Rede London",
    context: "Espaço Vip",
    desc: "[Unigospel & Rede London] Ajuste no Flow Builder para permitir mensagens contendo mídia/áudio sem texto (commit 390161f); diagnóstico de timeout na plataforma Rede London e monitoramento de serviços no Easypanel.",
    billable: "Sim"
  },

  // 03/11/2026 (Terça-feira)
  {
    row: 209,
    dateSheets: "03/11/2026",
    dateDb: "2026-11-03",
    start: "07:25",
    end: "07:45",
    duration: "00:20:00",
    category: "Organização Financeira",
    client: "Pessoal / Magnus",
    context: "Casa",
    desc: "[Financeiro / Imóveis] Conferência de comprovantes de recebimentos de locatários e atualização de status na planilha 'Magnus - Registro Alugueis' no Google Sheets.",
    billable: "Não"
  },
  {
    row: 210,
    dateSheets: "03/11/2026",
    dateDb: "2026-11-03",
    start: "07:45",
    end: "10:30",
    duration: "02:45:00",
    category: "Pessoal / Rotina",
    client: "Pessoal / Igreja Videira",
    context: "Casa / Trânsito",
    desc: "Rotina matinal, organização pessoal, pesquisa de material de discipulado ('Multiplicando Discípulos') e deslocamento para o Espaço Vip.",
    billable: "Não"
  },
  {
    row: 211,
    dateSheets: "03/11/2026",
    dateDb: "2026-11-03",
    start: "10:30",
    end: "11:15",
    duration: "00:45:00",
    category: "Triagem de E-mails",
    client: "Rhemarketing",
    context: "Espaço Vip",
    desc: "Triagem de e-mails corporativos nos Gmails (rhemarketando e soupatrickmendes): aceites de convites empresariais, comunicados bancários e segurança de contas.",
    billable: "Sim"
  },
  {
    row: 212,
    dateSheets: "03/11/2026",
    dateDb: "2026-11-03",
    start: "11:15",
    end: "12:30",
    duration: "01:15:00",
    category: "Tráfego Pago",
    client: "Rhemarketing (SOS Celulares)",
    context: "Espaço Vip",
    desc: "[Tráfego Pago] Configuração e integração do portfólio empresarial da SOS Celulares no Meta Business Suite e páginas vinculadas no Facebook para gestão de anúncios.",
    billable: "Sim"
  },
  {
    row: 213,
    dateSheets: "03/11/2026",
    dateDb: "2026-11-03",
    start: "12:30",
    end: "13:45",
    duration: "01:15:00",
    category: "Almoço / Descanso",
    client: "Pessoal",
    context: "Espaço Vip / Casa",
    desc: "Intervalo de almoço e descanso.",
    billable: "Não"
  },
  {
    row: 214,
    dateSheets: "03/11/2026",
    dateDb: "2026-11-03",
    start: "13:45",
    end: "17:30",
    duration: "03:45:00",
    category: "Trabalho",
    client: "Unigospel",
    context: "Espaço Vip",
    desc: "[Unigospel / Automações] Aplicação e persistência de delays de cards na transição de mensagens interativas do Flow Builder (commit cec10ff); testes exaustivos no painel gestor (unigospel.com/gestor.php) e filas de disparos do WhatsApp.",
    billable: "Sim"
  },
  {
    row: 215,
    dateSheets: "03/11/2026",
    dateDb: "2026-11-03",
    start: "17:30",
    end: "19:05",
    duration: "01:35:00",
    category: "Trabalho",
    client: "Rhemarketing / Unigospel",
    context: "Espaço Vip",
    desc: "Atendimento, alinhamento de mensagens com clientes e leads via WhatsApp Web; fechamento do expediente às 19:05.",
    billable: "Sim"
  },

  // 04/11/2026 (Quarta-feira)
  {
    row: 216,
    dateSheets: "04/11/2026",
    dateDb: "2026-11-04",
    start: "09:00",
    end: "13:00",
    duration: "04:00:00",
    category: "Trabalho",
    client: "Unigospel",
    context: "Espaço Vip",
    desc: "[Unigospel / Galeria Mundial & Automação] Maratona de 7 commits: deduplicação de disparos (04e1e13); auto-sweep da fila waiting_delivery (1e5e58b); migração para /galeria-mundial-herois-da-fe (927b4ef); correção de logos (05ce8b8); botão voltar responsivo (61ed13e); atualização para 280.728 renomados e fonte mobile (30f0e41); previews dinâmicos Open Graph para WhatsApp (0883f56).",
    billable: "Sim"
  },
  {
    row: 217,
    dateSheets: "04/11/2026",
    dateDb: "2026-11-04",
    start: "13:00",
    end: "14:45",
    duration: "01:45:00",
    category: "Almoço / Descanso",
    client: "Pessoal",
    context: "Espaço Vip / Casa",
    desc: "Intervalo de almoço e descanso.",
    billable: "Não"
  },
  {
    row: 218,
    dateSheets: "04/11/2026",
    dateDb: "2026-11-04",
    start: "14:45",
    end: "15:30",
    duration: "00:45:00",
    category: "Produtividade / Pesquisa",
    client: "Pessoal",
    context: "Espaço Vip",
    desc: "Pesquisa e testes com IA no Gemini e ChatGPT sobre widgets de atalho e gravação rápida de voz na tela de bloqueio do iPhone 13 (app Just Press Record).",
    billable: "Não"
  },
  {
    row: 219,
    dateSheets: "04/11/2026",
    dateDb: "2026-11-04",
    start: "15:30",
    end: "16:30",
    duration: "01:00:00",
    category: "Trabalho",
    client: "Unigospel",
    context: "Espaço Vip",
    desc: "[Unigospel / Homologação] Validação em produção das páginas individuais da Galeria Mundial Heróis da Fé (caso de teste Marivaldo Moraes Nascimento) e conferência de metatags no WhatsApp.",
    billable: "Sim"
  },
  {
    row: 220,
    dateSheets: "04/11/2026",
    dateDb: "2026-11-04",
    start: "16:30",
    end: "17:15",
    duration: "00:45:00",
    category: "Organização Financeira",
    client: "Pessoal / Magnus",
    context: "Espaço Vip",
    desc: "[Financeiro / Imóveis] Conferência de conciliação bancária, atualização de pagamentos e pendências na planilha 'Magnus - Registro Alugueis' no Google Sheets.",
    billable: "Não"
  },
  {
    row: 221,
    dateSheets: "04/11/2026",
    dateDb: "2026-11-04",
    start: "17:15",
    end: "17:40",
    duration: "00:25:00",
    category: "Triagem de E-mails",
    client: "Rhemarketing",
    context: "Espaço Vip",
    desc: "Triagem rápida de e-mails corporativos de final de tarde e alinhamento de mensagens no WhatsApp Web.",
    billable: "Sim"
  },

  // 05/11/2026 (Quinta-feira)
  {
    row: 222,
    dateSheets: "05/11/2026",
    dateDb: "2026-11-05",
    start: "09:20",
    end: "11:30",
    duration: "02:10:00",
    category: "Tráfego Pago",
    client: "Rhemarketing (SOS Celulares & Sempre Bella)",
    context: "Espaço Vip",
    desc: "[Tráfego Pago] Gestão e auditoria de campanhas no Meta Ads Manager e Meta Business Suite para SOS Celulares e Sempre Bella (análise de veiculação, custos por lead e orçamento).",
    billable: "Sim"
  },
  {
    row: 223,
    dateSheets: "05/11/2026",
    dateDb: "2026-11-05",
    start: "11:30",
    end: "13:30",
    duration: "02:00:00",
    category: "Trabalho",
    client: "Unigospel",
    context: "Espaço Vip",
    desc: "[Unigospel / Automações] Cancelamento de fallback pendente de 20min ao receber mensagem de entrada do lead e disparo de eventos do site via Flow Builder (commit 1eb89c4); ajustes finos nas regras do Gestor.",
    billable: "Sim"
  },
  {
    row: 224,
    dateSheets: "05/11/2026",
    dateDb: "2026-11-05",
    start: "13:30",
    end: "14:15",
    duration: "00:45:00",
    category: "Almoço / Descanso",
    client: "Pessoal",
    context: "Espaço Vip / Casa",
    desc: "Intervalo de almoço e descanso.",
    billable: "Não"
  },
  {
    row: 225,
    dateSheets: "05/11/2026",
    dateDb: "2026-11-05",
    start: "14:15",
    end: "15:00",
    duration: "00:45:00",
    category: "Triagem de E-mails",
    client: "Rhemarketing",
    context: "Espaço Vip",
    desc: "Triagem e resolução de notificações nos Gmails (rhemarketando e soupatrickmendes): confirmação de controle de conta de anúncios SOS Celulares Itba pelo Meta e notificações financeiras Nu Empresas.",
    billable: "Sim"
  },
  {
    row: 226,
    dateSheets: "05/11/2026",
    dateDb: "2026-11-05",
    start: "15:00",
    end: "16:40",
    duration: "01:40:00",
    category: "Trabalho",
    client: "Rhemarketing",
    context: "Espaço Vip",
    desc: "Atendimento ao cliente, alinhamento de briefings no WhatsApp Web e conferência de mensagens e Directs no Instagram.",
    billable: "Sim"
  },
  {
    row: 227,
    dateSheets: "05/11/2026",
    dateDb: "2026-11-05",
    start: "16:40",
    end: "17:00",
    duration: "00:20:00",
    category: "Produtividade / Pesquisa",
    client: "Pessoal / Tecnologia",
    context: "Espaço Vip",
    desc: "Pesquisa técnica no Google Gemini sobre Antigravity CLI Mobile e configurações de virtual host no ambiente local Laragon.",
    billable: "Não"
  },

  // 06/11/2026 (Sexta-feira)
  {
    row: 228,
    dateSheets: "06/11/2026",
    dateDb: "2026-11-06",
    start: "09:30",
    end: "10:20",
    duration: "00:50:00",
    category: "Triagem de E-mails",
    client: "Rhemarketing",
    context: "Espaço Vip",
    desc: "Triagem nos Gmails: notificações de segurança do GitHub (permissões de aplicativos autorizados para o Claude), e-mails de clientes e comunicados operacionais.",
    billable: "Sim"
  },
  {
    row: 229,
    dateSheets: "06/11/2026",
    dateDb: "2026-11-06",
    start: "10:20",
    end: "11:50",
    duration: "01:30:00",
    category: "Produtividade / Pesquisa",
    client: "Pessoal / Tecnologia",
    context: "Espaço Vip",
    desc: "Estudo de tendências tecnológicas no YouTube: comparativo e produtividade entre Grok Bot e Claude, além de análises do mercado cripto e segurança na Binance.",
    billable: "Não"
  },
  {
    row: 230,
    dateSheets: "06/11/2026",
    dateDb: "2026-11-06",
    start: "11:50",
    end: "14:30",
    duration: "02:40:00",
    category: "Almoço / Descanso",
    client: "Pessoal",
    context: "Espaço Vip / Casa",
    desc: "Intervalo de almoço e descanso.",
    billable: "Não"
  },
  {
    row: 231,
    dateSheets: "06/11/2026",
    dateDb: "2026-11-06",
    start: "14:30",
    end: "15:45",
    duration: "01:15:00",
    category: "Trabalho",
    client: "Unigospel",
    context: "Espaço Vip",
    desc: "[Unigospel / Provas & Matrícula] Bloqueio da prova de teologia até aprovação na admissão, liberação automática da matrícula e atualização do template da mensagem 6 no WhatsApp (commit 1317e33).",
    billable: "Sim"
  },
  {
    row: 232,
    dateSheets: "06/11/2026",
    dateDb: "2026-11-06",
    start: "15:45",
    end: "16:30",
    duration: "00:45:00",
    category: "Trabalho",
    client: "Rhemarketing / Portfólio",
    context: "Espaço Vip",
    desc: "[Desenvolvimento / Portfólio] Estruturação da landing page e apresentação profissional pessoal (Patrick Mendes - Web Designer e Gestor de Agentes IA).",
    billable: "Sim"
  },
  {
    row: 233,
    dateSheets: "06/11/2026",
    dateDb: "2026-11-06",
    start: "16:30",
    end: "17:05",
    duration: "00:35:00",
    category: "Organização Financeira",
    client: "Pessoal / Financeiro",
    context: "Espaço Vip",
    desc: "[Financeiro] Gestão de conta PJ no Mercado Pago, conciliação de saldos Pix e conferência de cartões Caixa.",
    billable: "Não"
  },
  {
    row: 234,
    dateSheets: "06/11/2026",
    dateDb: "2026-11-06",
    start: "17:05",
    end: "17:30",
    duration: "00:25:00",
    category: "Produtividade / Gestão",
    client: "Rhemarketing",
    context: "Espaço Vip",
    desc: "Organização e checklist de demandas no Google Tasks e WhatsApp Web para fechamento da semana.",
    billable: "Sim"
  },

  // 09/11/2026 (Segunda-feira - Hoje)
  {
    row: 235,
    dateSheets: "09/11/2026",
    dateDb: "2026-11-09",
    start: "08:35",
    end: "08:50",
    duration: "00:15:00",
    category: "Produtividade / Gestão",
    client: "Pessoal / Tecnologia",
    context: "Espaço Vip",
    desc: "Organização de acessos, cofre de senhas e atualização de credenciais no NordPass.",
    billable: "Não"
  },
  {
    row: 236,
    dateSheets: "09/11/2026",
    dateDb: "2026-11-09",
    start: "08:50",
    end: "09:05",
    duration: "00:15:00",
    category: "Triagem de E-mails",
    client: "Rhemarketing",
    context: "Espaço Vip",
    desc: "Triagem nos três Gmails (rhemarketando, soupatrickmendes, diedaygrace): leitura de relatórios mensais de performance de marketing de outubro (Sempre Bella e Patrick Mendes Marketing) e avisos bancários Pix.",
    billable: "Sim"
  },
  {
    row: 237,
    dateSheets: "09/11/2026",
    dateDb: "2026-11-09",
    start: "09:05",
    end: "09:20",
    duration: "00:15:00",
    category: "Tráfego Pago",
    client: "Rhemarketing (SOS Celulares)",
    context: "Espaço Vip",
    desc: "[Tráfego Pago] Auditoria analítica no Meta Ads Manager (conta SOS Celulares 417025303688242): faturamento, cobranças, valor gasto, alcance, impressões, CPM e custo por mensagem iniciada segmentado por idade, gênero e posicionamento.",
    billable: "Sim"
  },
  {
    row: 238,
    dateSheets: "09/11/2026",
    dateDb: "2026-11-09",
    start: "09:20",
    end: "09:50",
    duration: "00:30:00",
    category: "Produtividade / Gestão",
    client: "Rhemarketing / Diário de Bordo",
    context: "Espaço Vip",
    desc: "Conferência de tarefas no Google Tasks, alinhamentos e início da sessão no Antigravity para levantamento e fechamento das atividades do mês.",
    billable: "Sim"
  }
];

async function syncToDatabase() {
  console.log("1. Conectando ao banco de dados MariaDB...");
  const conn = await mysql.createConnection({
    uri: DATABASE_URL,
    ssl: false
  });

  console.log(`Inserindo/sincronizando ${entries.length} registros no banco de dados...`);
  let inserted = 0;
  let updated = 0;
  for (const item of entries) {
    const [existing] = await conn.query(
      "SELECT id FROM diario_bordo_entries WHERE entry_date = ? AND start_time = ? AND end_time = ?",
      [item.dateDb, item.start, item.end]
    );
    if (Array.isArray(existing) && existing.length > 0) {
      await conn.query(
        `UPDATE diario_bordo_entries 
         SET duration = ?, category = ?, project_client = ?, context_location = ?, description = ?, billable = ?
         WHERE id = ?`,
        [item.duration, item.category, item.client, item.context, item.desc, item.billable, existing[0].id]
      );
      updated++;
    } else {
      await conn.query(
        `INSERT INTO diario_bordo_entries 
         (entry_date, start_time, end_time, duration, category, project_client, context_location, description, billable)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [item.dateDb, item.start, item.end, item.duration, item.category, item.client, item.context, item.desc, item.billable]
      );
      inserted++;
    }
  }

  const [countRows] = await conn.query("SELECT COUNT(*) as total FROM diario_bordo_entries");
  console.log(`MariaDB: ${inserted} inseridos, ${updated} atualizados. Total no banco agora: ${countRows[0].total}`);
  await conn.end();
}

async function getValidGoogleToken() {
  const tokenPath = "C:/Users/Patrick/.gemini/antigravity/plugin_data/gsheets/token.json";
  const tokenData = JSON.parse(fs.readFileSync(tokenPath, "utf8"));

  try {
    const refreshRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: tokenData.client_id,
        client_secret: tokenData.client_secret,
        refresh_token: tokenData.token.refresh_token,
        grant_type: "refresh_token"
      })
    });
    const refreshed = await refreshRes.json();
    if (refreshed.access_token) {
      tokenData.token.access_token = refreshed.access_token;
      fs.writeFileSync(tokenPath, JSON.stringify(tokenData, null, 2), "utf8");
      console.log("Token OAuth Google atualizado com sucesso!");
      return refreshed.access_token;
    }
  } catch (err) {
    console.warn("Aviso ao renovar token OAuth:", err);
  }
  return tokenData.token.access_token;
}

async function syncToGoogleSheets() {
  console.log("2. Atualizando Google Spreadsheet...");
  const token = await getValidGoogleToken();

  const rowsToInsert = entries.map(e => [
    e.dateSheets,
    e.start,
    e.end,
    `=C${e.row}-B${e.row}`,
    e.category,
    e.client,
    e.context,
    e.desc,
    e.billable
  ]);

  const range = `'Diário de Bordo'!A203:I${202 + entries.length}`;
  console.log(`Inserindo no Sheets range: ${range}...`);

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      range,
      majorDimension: "ROWS",
      values: rowsToInsert
    })
  });

  const data = await res.json();
  if (data.updatedCells) {
    console.log(`Google Sheets: SUCESSO! (${data.updatedCells} células atualizadas em ${data.updatedRows} linhas)`);
  } else {
    console.error("Google Sheets Error:", JSON.stringify(data, null, 2));
    throw new Error("Falha ao salvar no Google Sheets");
  }
}

async function main() {
  try {
    await syncToDatabase();
    await syncToGoogleSheets();
    console.log("\n==========================================");
    console.log("✅ SINCRONIZAÇÃO COMPLETA COM SUCESSO!");
    console.log("==========================================");
  } catch (error) {
    console.error("Erro durante a execução:", error);
    process.exit(1);
  }
}

main();

export { entries, syncToDatabase, syncToGoogleSheets };
