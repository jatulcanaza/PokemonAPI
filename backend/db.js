import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST || "db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "admin",
  database: process.env.DB_NAME || "poke_users",
  port: 5432
});

// Crear tabla si no existe
(async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    );
  `;
  try {
    await pool.query(query);
    console.log("✅ Tabla 'users' lista en PostgreSQL");
    const queryLogs = `
      CREATE TABLE IF NOT EXISTS search_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        query VARCHAR(100) NOT NULL,
        searched_at TIMESTAMP DEFAULT NOW()
      );
    `;
    await pool.query(queryLogs);
    console.log("✅ Tabla 'search_logs' lista en PostgreSQL");
  } catch (err) {
    console.error("❌ Error al crear tabla:", err);
  }
})();

export default pool;
