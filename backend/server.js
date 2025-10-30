// index.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import db from "./db.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

let sessions = {}; // 🔹 Sesiones simples en memoria

// 🔹 Endpoint de prueba de conexión a la DB
app.get("/test-db", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error conectando a la DB", error: err });
  }
});

// 🔸 Registrar usuario
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    await db.query(
      "INSERT INTO users (username, password) VALUES ($1, $2)",
      [username, password]
    );
    res.json({ message: "✅ Usuario registrado con éxito" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al registrar usuario" });
  }
});

// 🔸 Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query(
      "SELECT * FROM users WHERE username = $1 AND password = $2",
      [username, password]
    );

    if (result.rows.length > 0) {
      const token = Math.random().toString(36).substring(2);
      sessions[token] = username;
      res.json({ message: "✅ Login exitoso", token });
    } else {
      res.status(401).json({ message: "❌ Credenciales incorrectas" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error al verificar login" });
  }
});

// 🔸 Verificar sesión
app.get("/session/:token", (req, res) => {
  const { token } = req.params;
  if (sessions[token]) {
    res.json({ loggedIn: true, user: sessions[token] });
  } else {
    res.json({ loggedIn: false });
  }
});

// 🔸 Leer todos los usuarios
app.get("/users", async (req, res) => {
  try {
    const result = await db.query("SELECT id, username FROM users");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener usuarios", error: err });
  }
});

// 🔸 Leer un usuario por ID
app.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT id, username FROM users WHERE id = $1", [id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: "Usuario no encontrado" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error al obtener usuario", error: err });
  }
});

// 🔸 Actualizar usuario
app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;
  try {
    await db.query(
      "UPDATE users SET username = $1, password = $2 WHERE id = $3",
      [username, password, id]
    );
    res.json({ message: "✅ Usuario actualizado" });
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar usuario", error: err });
  }
});

// 🔸 Eliminar usuario
app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ message: "✅ Usuario eliminado" });
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar usuario", error: err });
  }
});

// 🔸 Registrar búsqueda de Pokémon
app.post("/search-log", async (req, res) => {
  const { name, token } = req.body;
  if (!token || !sessions[token]) {
    return res.status(401).json({ message: "Sesión inválida o expirada" });
  }
  if (!name || typeof name !== "string") {
    return res.status(400).json({ message: "Parámetro 'name' requerido" });
  }
  const username = sessions[token];
  try {
    const userResult = await db.query("SELECT id FROM users WHERE username = $1", [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const userId = userResult.rows[0].id;
    await db.query(
      "INSERT INTO search_logs (user_id, query) VALUES ($1, $2)",
      [userId, name]
    );
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Error al guardar búsqueda", error: err });
  }
});

// 🔹 Levantar servidor
app.listen(3000, () => console.log("🚀 Backend corriendo en http://localhost:3000"));
