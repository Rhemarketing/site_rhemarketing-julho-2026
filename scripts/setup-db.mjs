import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const DATABASE_URL = "mariadb://espacovip:R3nhc1b816nsv44ANrODZif8meIluP1M@179.236.73.45:3306/espacovip";

async function main() {
  console.log("Conectando ao banco de dados...");
  const connection = await mysql.createConnection({
    uri: DATABASE_URL,
    ssl: false,
  });

  console.log("Conectado com sucesso!");

  console.log("Criando tabela admin_users se não existir...");
  await connection.query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log("Criando tabela gallery_items se não existir...");
  await connection.query(`
    CREATE TABLE IF NOT EXISTS gallery_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      type ENUM('design', 'video') NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NULL,
      file_path VARCHAR(500) NOT NULL,
      thumbnail_path VARCHAR(500) NULL,
      external_url VARCHAR(500) NULL,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_type (type),
      INDEX idx_sort (sort_order DESC, id DESC)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  const username = "patrick@marketing";
  const password = "f5u9b1a7gf3r7498gdf56fg75";

  console.log(`Gerando hash para usuário ${username}...`);
  const passwordHash = await bcrypt.hash(password, 10);

  const [existing] = await connection.query(
    "SELECT id FROM admin_users WHERE username = ?",
    [username]
  );

  if (Array.isArray(existing) && existing.length > 0) {
    console.log("Atualizando senha do usuário existente...");
    await connection.query(
      "UPDATE admin_users SET password_hash = ? WHERE username = ?",
      [passwordHash, username]
    );
  } else {
    console.log("Inserindo novo usuário admin...");
    await connection.query(
      "INSERT INTO admin_users (username, password_hash) VALUES (?, ?)",
      [username, passwordHash]
    );
  }

  console.log("Configuração do banco de dados concluída com sucesso!");
  await connection.end();
}

main().catch((err) => {
  console.error("Erro ao configurar banco de dados:", err);
  process.exit(1);
});
