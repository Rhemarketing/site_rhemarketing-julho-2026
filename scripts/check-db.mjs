import mysql from "mysql2/promise";

const DATABASE_URL = "mariadb://espacovip:R3nhc1b816nsv44ANrODZif8meIluP1M@179.236.73.45:3306/espacovip";

const conn = await mysql.createConnection({
  uri: DATABASE_URL,
  ssl: false
});

const [rows] = await conn.query("SELECT MAX(entry_date) as max_date, COUNT(*) as count FROM diario_bordo_entries");
console.log("DB status:", rows);

const [dates] = await conn.query("SELECT DISTINCT DATE_FORMAT(entry_date, '%Y-%m-%d') as dt FROM diario_bordo_entries ORDER BY dt DESC LIMIT 10");
console.log("Latest dates in DB:", dates);

await conn.end();
