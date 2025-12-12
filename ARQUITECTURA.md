# 📋 ARQUITECTURA Y ESTRUCTURA DEL PROYECTO POKEAPP

## 🏗️ VISIÓN GENERAL

**PokeApp** es una aplicación web full-stack que permite a usuarios autenticados buscar información de Pokémon y registrar sus búsquedas en una base de datos. La aplicación está completamente dockerizada y lista para desplegarse.

### Stack Tecnológico
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js + Express.js
- **Base de Datos**: PostgreSQL 16
- **Orquestación**: Docker Compose
- **Servidor Web**: Nginx (para frontend)
- **API Externa**: PokeAPI (https://pokeapi.co)

---

## 📁 ESTRUCTURA DE DIRECTORIOS

```
pokeapp/
├── backend/                    # Servidor Node.js/Express
│   ├── db.js                   # Configuración y pool de PostgreSQL
│   ├── server.js               # API REST principal
│   ├── wait-server.js          # Script de espera para PostgreSQL
│   ├── Dockerfile              # Imagen Docker del backend
│   ├── package.json            # Dependencias del backend
│   └── node_modules/           # Dependencias instaladas
│
├── frontend/                    # Aplicación web cliente
│   ├── index.html              # Página de login
│   ├── main.js                 # Lógica de login
│   ├── register.html           # Página de registro
│   ├── register.js             # Lógica de registro
│   ├── pokemons.html           # Página del buscador
│   ├── pokemons.js             # Lógica del buscador
│   ├── style.css               # Estilos globales
│   ├── Dockerfile              # Imagen Docker del frontend (Nginx)
│   └── node_modules/           # (si existe)
│
├── docker-compose.yml          # Orquestación de servicios
├── package.json                # Dependencias raíz (wait-port)
└── package-lock.json           # Lock de dependencias
```

---

## 🎯 ARQUITECTURA DE CAPAS

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Nginx)                     │
│  ┌──────────┐  ┌──────────┐  ┌─────────────┐          │
│  │ Login    │  │ Register │  │ Buscador    │          │
│  │ (HTML/JS)│  │ (HTML/JS)│  │ (HTML/JS)   │          │
│  └──────────┘  └──────────┘  └─────────────┘          │
│         │              │              │                 │
│         └──────────────┼──────────────┘                 │
│                        │                                │
│              HTTP Requests (fetch)                      │
└────────────────────────┼────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Express.js)                        │
│  ┌──────────────────────────────────────────┐           │
│  │  API REST Endpoints                      │           │
│  │  - POST /register                        │           │
│  │  - POST /login                           │           │
│  │  - POST /search-log                      │           │
│  │  - GET  /users                           │           │
│  │  - GET  /users/:id                       │           │
│  │  - PUT  /users/:id                       │           │
│  │  - DELETE /users/:id                     │           │
│  │  - GET  /session/:token                  │           │
│  └──────────────────────────────────────────┘           │
│         │                                                │
│         │ Sessions (en memoria)                         │
│         │ sessions = { token: username }                │
└─────────┼────────────────────────────────────────────────┘
          │
          │ SQL Queries (pg)
          ▼
┌─────────────────────────────────────────────────────────┐
│            BASE DE DATOS (PostgreSQL)                    │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │  users           │  │  search_logs     │            │
│  │  - id            │  │  - id            │            │
│  │  - username      │  │  - user_id (FK)  │            │
│  │  - password      │  │  - query         │            │
│  └──────────────────┘  │  - searched_at   │            │
│                        └──────────────────┘            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              API EXTERNA (PokeAPI)                       │
│  https://pokeapi.co/api/v2/pokemon                      │
│  - GET /pokemon?limit=1000                              │
│  - GET /pokemon/{name}                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUJO DE DATOS Y FUNCIONAMIENTO

### 1. **FLUJO DE REGISTRO**

```
Usuario → register.html
    ↓
Escribe username/password
    ↓
register.js → POST /register
    ↓
backend/server.js → INSERT INTO users
    ↓
PostgreSQL guarda usuario
    ↓
Backend responde éxito
    ↓
Frontend redirige a index.html (login)
```

**Archivos involucrados:**
- `frontend/register.html` → UI del formulario
- `frontend/register.js` → Lógica de registro (líneas 1-37)
- `backend/server.js` → Endpoint `/register` (líneas 24-36)

### 2. **FLUJO DE LOGIN**

```
Usuario → index.html
    ↓
Escribe username/password
    ↓
main.js → POST /login
    ↓
backend/server.js → SELECT * FROM users WHERE...
    ↓
Si credenciales válidas:
    - Genera token aleatorio
    - Guarda en sessions[token] = username
    - Responde con { token }
    ↓
main.js → localStorage.setItem("token", token)
    ↓
Redirige a pokemons.html
```

**Archivos involucrados:**
- `frontend/index.html` → UI del login
- `frontend/main.js` → Lógica de login (líneas 1-24)
- `backend/server.js` → Endpoint `/login` (líneas 39-57)

### 3. **FLUJO DE BÚSQUEDA DE POKÉMON**

```
Usuario → pokemons.html (ya autenticado)
    ↓
Carga inicial: loadPokemons()
    ↓
pokemons.js → GET https://pokeapi.co/api/v2/pokemon?limit=1000
    ↓
PokeAPI responde lista de ~1000 Pokémon
    ↓
Usuario escribe en input de búsqueda
    ↓
Event listener "input" → filtra por nombre
    ↓
Muestra sugerencias (máx 10)
    ↓
Usuario selecciona Pokémon
    ↓
showPokemonDetails(name)
    ↓
GET https://pokeapi.co/api/v2/pokemon/{name}
    ↓
PokeAPI responde detalles del Pokémon
    ↓
Muestra imagen, nombre, altura, peso, tipos
    ↓
POST /search-log (silencioso, en background)
    ↓
backend/server.js → INSERT INTO search_logs
    ↓
PostgreSQL guarda búsqueda
```

**Archivos involucrados:**
- `frontend/pokemons.html` → UI del buscador
- `frontend/pokemons.js` → Lógica completa (líneas 1-83)
- `backend/server.js` → Endpoint `/search-log` (líneas 121-144)

---

## 🗄️ BASE DE DATOS

### **Tabla: `users`**

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);
```

**Campos:**
- `id`: Identificador único autoincremental
- `username`: Nombre de usuario (único)
- `password`: Contraseña (actualmente en texto plano)

**Relaciones:**
- Un usuario puede tener múltiples búsquedas (1:N con `search_logs`)

### **Tabla: `search_logs`**

```sql
CREATE TABLE search_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    query VARCHAR(100) NOT NULL,
    searched_at TIMESTAMP DEFAULT NOW()
);
```

**Campos:**
- `id`: Identificador único autoincremental
- `user_id`: Foreign Key hacia `users.id`
- `query`: Nombre del Pokémon buscado
- `searched_at`: Timestamp automático de la búsqueda

**Relaciones:**
- Muchas búsquedas pertenecen a un usuario (N:1 con `users`)
- Si se elimina un usuario, se eliminan sus búsquedas (CASCADE)

**Inicialización:**
Las tablas se crean automáticamente al iniciar el backend mediante `backend/db.js` (líneas 14-37).

---

## 🔌 API ENDPOINTS (Backend)

### **Base URL:** `http://localhost:3000`

### **1. POST /register**
Registra un nuevo usuario.

**Request Body:**
```json
{
  "username": "usuario123",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "✅ Usuario registrado con éxito"
}
```

**Código:** `backend/server.js` líneas 24-36

---

### **2. POST /login**
Autentica un usuario y genera token de sesión.

**Request Body:**
```json
{
  "username": "usuario123",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "✅ Login exitoso",
  "token": "abc123xyz..."
}
```

**Response (401 Unauthorized):**
```json
{
  "message": "❌ Credenciales incorrectas"
}
```

**Código:** `backend/server.js` líneas 39-57

---

### **3. POST /search-log**
Registra una búsqueda de Pokémon en la base de datos.

**Request Body:**
```json
{
  "name": "pikachu",
  "token": "abc123xyz..."
}
```

**Response (204 No Content):** Éxito (sin cuerpo)

**Response (401 Unauthorized):**
```json
{
  "message": "Sesión inválida o expirada"
}
```

**Código:** `backend/server.js` líneas 121-144

---

### **4. GET /session/:token**
Verifica si un token de sesión es válido.

**Response (200 OK):**
```json
{
  "loggedIn": true,
  "user": "usuario123"
}
```

o

```json
{
  "loggedIn": false
}
```

**Código:** `backend/server.js` líneas 60-67

---

### **5. GET /users**
Obtiene todos los usuarios (solo id y username).

**Response (200 OK):**
```json
[
  { "id": 1, "username": "usuario1" },
  { "id": 2, "username": "usuario2" }
]
```

**Código:** `backend/server.js` líneas 70-77

---

### **6. GET /users/:id**
Obtiene un usuario por ID.

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "usuario1"
}
```

**Response (404 Not Found):**
```json
{
  "message": "Usuario no encontrado"
}
```

**Código:** `backend/server.js` líneas 80-92

---

### **7. PUT /users/:id**
Actualiza un usuario.

**Request Body:**
```json
{
  "username": "nuevo_usuario",
  "password": "nueva_password"
}
```

**Response (200 OK):**
```json
{
  "message": "✅ Usuario actualizado"
}
```

**Código:** `backend/server.js` líneas 95-107

---

### **8. DELETE /users/:id**
Elimina un usuario (y sus búsquedas por CASCADE).

**Response (200 OK):**
```json
{
  "message": "✅ Usuario eliminado"
}
```

**Código:** `backend/server.js` líneas 110-118

---

### **9. GET /test-db**
Endpoint de prueba para verificar conexión a PostgreSQL.

**Response (200 OK):**
```json
{
  "now": "2024-01-15T10:30:00.000Z"
}
```

**Código:** `backend/server.js` líneas 14-21

---

## 🐳 DOCKERIZACIÓN

### **docker-compose.yml**

Define 3 servicios:

#### **1. Servicio `db` (PostgreSQL)**
- **Imagen:** `postgres:16`
- **Puerto:** `5432:5432`
- **Variables de entorno:**
  - `POSTGRES_USER=postgres`
  - `POSTGRES_PASSWORD=admin`
  - `POSTGRES_DB=poke_users`
- **Volumen persistente:** `pokeapp_pokeapp_db_data`

#### **2. Servicio `backend`**
- **Imagen:** `juantulcanaza/pokeapp-backend:latest` (Docker Hub)
- **Build:** `./backend/Dockerfile` (fallback)
- **Puerto:** `3000:3000`
- **Dependencias:** `db`
- **Variables de entorno:**
  - `DB_HOST=db`
  - `DB_USER=postgres`
  - `DB_PASS=admin`
  - `DB_NAME=poke_users`

#### **3. Servicio `frontend`**
- **Imagen:** `juantulcanaza/pokeapp-frontend:latest` (Docker Hub)
- **Build:** `./frontend/Dockerfile` (fallback)
- **Puerto:** `8080:80`
- **Dependencias:** `backend`

### **Backend Dockerfile**

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

**Características:**
- Base: Node.js 18
- Instala dependencias
- Ejecuta `wait-server.js` para esperar PostgreSQL

### **Frontend Dockerfile**

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
```

**Características:**
- Base: Nginx Alpine (ligero)
- Copia archivos estáticos
- Sirve en puerto 80

### **wait-server.js**

Script que espera a que PostgreSQL esté disponible antes de iniciar el servidor Express.

**Flujo:**
1. Espera conexión a `db:5432` (timeout 30s)
2. Si conecta → importa `server.js` (inicia Express)
3. Si timeout → exit(1)

---

## 🔐 GESTIÓN DE SESIONES

### **Sistema Actual: En Memoria**

```javascript
let sessions = {}; // En server.js
```

**Funcionamiento:**
1. Al hacer login, se genera un token aleatorio:
   ```javascript
   const token = Math.random().toString(36).substring(2);
   sessions[token] = username;
   ```

2. El token se almacena en `localStorage` del navegador:
   ```javascript
   localStorage.setItem("token", token);
   ```

3. Cada request incluye el token:
   ```javascript
   body: JSON.stringify({ name, token })
   ```

**Limitaciones:**
- ⚠️ Las sesiones se pierden al reiniciar el backend
- ⚠️ No hay expiración de tokens
- ⚠️ No es escalable (no funciona con múltiples instancias)

**Mejora sugerida:** Usar JWT (JSON Web Tokens) con expiración.

---

## 🎨 FRONTEND: PÁGINAS Y FUNCIONALIDAD

### **1. index.html - Login**
- **Archivo:** `frontend/index.html`
- **Script:** `frontend/main.js`
- **Funcionalidad:**
  - Formulario de login
  - Botón de registro (redirige a `register.html`)
  - Validación de credenciales
  - Guarda token en `localStorage`
  - Redirige a `pokemons.html` si éxito

### **2. register.html - Registro**
- **Archivo:** `frontend/register.html`
- **Script:** `frontend/register.js`
- **Funcionalidad:**
  - Formulario de registro
  - Validación de campos
  - Envía POST a `/register`
  - Redirige a `index.html` si éxito

### **3. pokemons.html - Buscador**
- **Archivo:** `frontend/pokemons.html`
- **Script:** `frontend/pokemons.js`
- **Funcionalidad:**
  - Carga lista de ~1000 Pokémon al iniciar
  - Input de búsqueda con autocompletado
  - Muestra sugerencias mientras escribe
  - Al seleccionar → muestra detalles del Pokémon
  - Registra búsqueda en BD (silencioso)
  - Botón de logout

### **4. style.css - Estilos**
- **Archivo:** `frontend/style.css`
- **Contenido:**
  - Estilos para login (`.login-bg`, `#login-container`)
  - Estilos para buscador (`.buscador-bg`, `#app-container`)
  - Estilos para botones, inputs, cards de Pokémon

---

## 🔄 FLUJO COMPLETO DE USUARIO

```
1. Usuario abre http://localhost:8080
   ↓
2. Ve index.html (login)
   ↓
3a. Si no tiene cuenta → register.html → crea cuenta → vuelve a login
   ↓
3b. Ingresa credenciales → POST /login
   ↓
4. Backend valida → genera token → respuesta
   ↓
5. Frontend guarda token → redirige a pokemons.html
   ↓
6. pokemons.html carga lista de Pokémon (PokeAPI)
   ↓
7. Usuario busca Pokémon → autocompletado
   ↓
8. Usuario selecciona Pokémon → muestra detalles
   ↓
9. En background → POST /search-log → guarda en BD
   ↓
10. Usuario puede buscar más Pokémon o hacer logout
```

---

## 📊 DIAGRAMA DE SECUENCIA (Búsqueda de Pokémon)

```
Usuario    Frontend      Backend      PostgreSQL    PokeAPI
  │            │            │              │            │
  │──escribe──>│            │              │            │
  │            │            │              │            │
  │<──sugerencias──│            │              │            │
  │            │            │              │            │
  │──selecciona─>│            │              │            │
  │            │──GET pokemon/{name}───────────────────>│
  │            │<──detalles──────────────────────────────│
  │<──muestra──│            │              │            │
  │            │            │              │            │
  │            │──POST /search-log──────>│              │
  │            │            │──INSERT────>│              │
  │            │            │<──OK────────│              │
  │            │<──204─────│              │              │
```

---

## 🚀 COMANDOS DE DESPLIEGUE

### **Desarrollo Local**

```bash
# Construir y levantar servicios
docker compose up -d

# Ver logs
docker compose logs -f

# Detener servicios
docker compose down

# Detener y eliminar volúmenes
docker compose down -v
```

### **Publicar en Docker Hub**

```bash
# Login
docker login

# Construir imágenes
docker build -t juantulcanaza/pokeapp-backend:latest ./backend
docker build -t juantulcanaza/pokeapp-frontend:latest ./frontend

# Subir imágenes
docker push juantulcanaza/pokeapp-backend:latest
docker push juantulcanaza/pokeapp-frontend:latest
```

### **Usar imágenes de Docker Hub**

El `docker-compose.yml` ya está configurado para usar:
- `juantulcanaza/pokeapp-backend:latest`
- `juantulcanaza/pokeapp-frontend:latest`

Si la imagen no existe, Docker Compose construirá desde el Dockerfile local.

---

## ⚙️ CONFIGURACIÓN Y VARIABLES DE ENTORNO

### **Backend (server.js / db.js)**

| Variable | Default | Descripción |
|----------|---------|-------------|
| `DB_HOST` | `db` | Host de PostgreSQL |
| `DB_USER` | `postgres` | Usuario de PostgreSQL |
| `DB_PASS` | `admin` | Contraseña de PostgreSQL |
| `DB_NAME` | `poke_users` | Nombre de la base de datos |

### **Puertos**

| Servicio | Puerto Interno | Puerto Externo |
|----------|----------------|----------------|
| Frontend | 80 | 8080 |
| Backend | 3000 | 3000 |
| PostgreSQL | 5432 | 5432 |

---

## 🛡️ CONSIDERACIONES DE SEGURIDAD

### **⚠️ Problemas Actuales:**

1. **Contraseñas en texto plano**
   - Las contraseñas se almacenan sin hash
   - **Solución:** Usar bcrypt o argon2

2. **Sesiones en memoria**
   - No persistentes, no escalables
   - **Solución:** JWT con expiración

3. **CORS abierto**
   - `app.use(cors())` permite cualquier origen
   - **Solución:** Configurar origen específico

4. **Sin validación de entrada**
   - No hay sanitización de inputs
   - **Solución:** Validar y sanitizar datos

5. **Sin rate limiting**
   - Vulnerable a ataques de fuerza bruta
   - **Solución:** Implementar rate limiting

---

## 📈 MEJORAS FUTURAS SUGERIDAS

1. ✅ Hash de contraseñas (bcrypt)
2. ✅ JWT para sesiones
3. ✅ Validación y sanitización de inputs
4. ✅ Rate limiting
5. ✅ Endpoint para ver historial de búsquedas
6. ✅ Paginación en listado de usuarios
7. ✅ Logs estructurados
8. ✅ Tests unitarios e integración
9. ✅ CI/CD con GitHub Actions
10. ✅ Variables de entorno con archivo `.env`

---

## 📝 RESUMEN EJECUTIVO

**PokeApp** es una aplicación web de 3 capas:
- **Frontend:** HTML/CSS/JS vanilla servido por Nginx
- **Backend:** API REST con Express.js
- **Base de Datos:** PostgreSQL con 2 tablas (users, search_logs)

**Funcionalidades principales:**
- Registro y login de usuarios
- Búsqueda de Pokémon con autocompletado
- Registro automático de búsquedas en BD
- CRUD completo de usuarios

**Arquitectura:**
- Microservicios dockerizados
- Comunicación HTTP REST
- Sesiones en memoria (token simple)
- Integración con API externa (PokeAPI)

**Estado:** ✅ Funcional y listo para producción básica (mejoras de seguridad recomendadas).

---

**Fecha de documentación:** 2024
**Versión del proyecto:** 1.0.0


