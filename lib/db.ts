import mysql from "mysql2/promise";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "mariadb://espacovip:R3nhc1b816nsv44ANrODZif8meIluP1M@179.236.73.45:3306/espacovip";

export function getDbPool() {
  return {
    async query(sql: string, params?: any[]) {
      const conn = await mysql.createConnection({
        uri: DATABASE_URL,
        disableEval: true,
      });
      try {
        return await conn.query(sql, params);
      } finally {
        await conn.end().catch(() => {});
      }
    },
    async execute(sql: string, params?: any[]) {
      const conn = await mysql.createConnection({
        uri: DATABASE_URL,
        disableEval: true,
      });
      try {
        return await conn.execute(sql, params);
      } finally {
        await conn.end().catch(() => {});
      }
    },
  };
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
