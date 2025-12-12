import express from "express";
import cors from "cors";
import db from "./db.js";
import bcrypt from "bcrypt";

const app = express();
app.use(cors());
app.use(express.json()); // bodyParser.json() reemplazado por express.json()

let sessions = {}; // Sesiones simples en memoria

// Endpoint de prueba de DB
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

  if (!username || !password) {
    return res.status(400).json({ message: "Por favor completa todos los campos" });
  }

  try {
    // Verificar si ya existe el usuario
    const userExists = await db.query("SELECT * FROM users WHERE username = $1", [username]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Usuario ya existe" });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    await db.query("INSERT INTO users (username, password) VALUES ($1, $2)", [username, hashedPassword]);
    res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (err) {
    console.error("Error al registrar usuario:", err);
    res.status(500).json({ message: "Error al registrar usuario" });
  }
});

// 🔸 Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Por favor completa todos los campos" });
  }

  try {
    const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const token = Math.random().toString(36).substring(2);
    sessions[token] = username;
    res.json({ message: "Login exitoso", token });
  } catch (err) {
    console.error("Error en login:", err);
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

// 🔸 Guardar búsqueda de Pokémon
app.post("/search-log", async (req, res) => {
  const { name, token } = req.body;
  if (!token || !sessions[token]) return res.status(401).json({ message: "Sesión inválida" });

  if (!name || typeof name !== "string") return res.status(400).json({ message: "Parámetro 'name' requerido" });

  try {
    const userResult = await db.query("SELECT id FROM users WHERE username = $1", [sessions[token]]);
    if (userResult.rows.length === 0) return res.status(404).json({ message: "Usuario no encontrado" });

    const userId = userResult.rows[0].id;
    await db.query("INSERT INTO search_logs (user_id, query) VALUES ($1, $2)", [userId, name]);
    res.status(204).send();
  } catch (err) {
    console.error("Error al guardar búsqueda:", err);
    res.status(500).json({ message: "Error al guardar búsqueda", error: err });
  }
});

// Levantar servidor
app.listen(3000, () => console.log("Backend corriendo en http://localhost:3000"));
