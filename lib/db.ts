import mysql, { Pool } from "mysql2/promise";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "mariadb://espacovip:R3nhc1b816nsv44ANrODZif8meIluP1M@179.236.73.45:3306/espacovip";

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      uri: DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
  }
  return pool;
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
