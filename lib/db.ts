import mysql from "mysql2/promise";

type Pool = mysql.Pool;

let poolInstance: Pool | null = null;

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "ERRO DE SEGURANÇA/CONFIGURAÇÃO: A variável de ambiente DATABASE_URL não está configurada."
    );
  }
  return url;
}

export function getDbPool(): Pool {
  if (!poolInstance) {
    poolInstance = mysql.createPool({
      uri: getDatabaseUrl(),
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 10,
      idleTimeout: 60000,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
  }
  return poolInstance;
}

export interface GalleryItem {
  id: number;
  type: "design" | "video";
  title: string;
  description: string | null;
  file_path: string;
  thumbnail_path: string | null;
  external_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at?: string;
}

export interface DiarioEntry {
  id: number;
  entry_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string;   // HH:MM
  duration: string;   // HH:MM:SS
  category: string;
  project_client: string;
  context_location: string;
  description: string;
  billable: "Sim" | "Não";
  created_at?: string;
  updated_at?: string;
}
