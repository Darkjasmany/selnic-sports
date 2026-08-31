# 🛠️ Manual Técnico — Sistema de Gestión Deportiva (selnic-sports)

Este documento describe la arquitectura, la configuración, los módulos, el modelo de datos y la
forma de levantar, mantener y extender el sistema `selnic-sports`.

---

## 1. Resumen de la arquitectura

El proyecto es una aplicación web de tipo **SPA (Single Page Application)** con una arquitectura
de **frontend y backend separados**:

- **Frontend:** React 19 + TypeScript + Vite 7 + Tailwind CSS 4 + React Hook Form + Zod +
  TanStack Query (React Query) + Zustand + **qrcode.react** (generación de QR codes).
- **Backend:** Node.js + TypeScript + Express + Prisma ORM.
- **Base de datos:** PostgreSQL (`selnic_sports_db` en `localhost:5432`).

```
┌─────────────────────┐      HTTP/JSON       ┌─────────────────────┐      SQL       ┌──────────────┐
│  Frontend (React)   │ ──────────────────►  │  Backend (Express)  │ ─────────────► │  PostgreSQL  │
│  Vite :5173         │   /api/**            │  Node :3000         │   Prisma ORM   │  selnic_sports_db   │
└─────────────────────┘                      └─────────────────────┘                └──────────────┘
```

---

## 2. Estructura del repositorio

```
selnic-sports/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Modelo de datos (fuente de verdad)
│   │   ├── seed.ts              # Datos iniciales (admin, disciplinas, categorías)
│   │   └── migrations/          # Migraciones SQL de Prisma
│   ├── src/
│   │   ├── server.ts            # Punto de entrada del backend
│   │   ├── app.ts               # Configuración de Express y montaje de rutas
│   │   ├── generated/           # Cliente Prisma generado
│   │   ├── config/              # Configuración y constantes
│   │   ├── middleware/          # Autenticación, validación, manejo de errores
│   │   └── modules/
│   │       ├── disciplines/     # Gestión de disciplinas (nuevo)
│   │       ├── categories/      # Gestión de categorías (por disciplina)
│   │       ├── teams/           # Equipos
│   │       ├── players/         # Jugadores
│   │       ├── matches/         # Partidos, validación, incidencias
│   │       ├── tournaments/     # Torneos + calendario, posiciones, estadísticas (nuevo)
│   │       └── admin/           # Usuarios y autenticación
│   │
│   └── .env                     # Variables de entorno del backend
│
├── frontend/
│   └── src/
│       ├── api/                 # Cliente HTTP base (axios) y utilidades
│       ├── components/          # Componentes UI compartidos (layout, sidebar)
│       ├── features/
│       │   ├── disciplines/     # Módulo de disciplinas
│       │   ├── categories/      # Módulo de categorías
│       │   ├── teams/           # Módulo de equipos
│       │   ├── players/         # Módulo de jugadores
│       │   ├── matches/         # Módulo de partidos (form + flujo + steps)
│       │   ├── tournaments/     # Módulo de torneos (nuevo)
│       │   ├── auth/            # Autenticación
│       │   └── admin/           # Usuarios
│       ├── pages/               # Dashboard
│       ├── store/               # Zustand (auth)
│       ├── router.tsx           # Definición de rutas
│       └── main.tsx             # Bootstrap de React
│
├── MANUAL_DE_USUARIO.md         # Manual de usuario (este repo lo referencia)
└── MANUAL_TECNICO.md            # Este documento
```

Cada módulo del backend sigue el patrón **schema → service → controller → router**:

```
modules/<nombre>/
├── <nombre>.schema.ts      # Validación Zod (validación de entrada)
├── <nombre>.service.ts     # Lógica de negocio y acceso a datos (Prisma)
├── <nombre>.controller.ts  # Manejo de peticiones HTTP
└── <nombre>.router.ts      # Definición de rutas REST
```

---

## 3. Requisitos previos

- **Node.js** 18+ (recomendado 20 LTS).
- **PostgreSQL** corriendo en `localhost:5432` con la base de datos `selnic_sports_db`.
- **npm** (o **pnpm/yarn**) para instalar dependencias.

---

## 4. Configuración de entorno

### Backend — `backend/.env`

```
DATABASE_URL="postgresql://postgres:<CLAVE>@localhost:5432/selnic_sports_db?schema=public"
PORT=3000
JWT_SECRET=<clave-secreta-para-jwt>
NODE_ENV=development
```

### Frontend — `frontend/.env`

```
VITE_API_URL=http://localhost:3000/api
```

> El frontend usa el cliente axios con `baseURL = VITE_API_URL`. El backend debe estar accesible
> desde esa URL.

---

## 5. Cómo levantar el sistema

### 5.1 Instalar dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 5.2 Preparar la base de datos

```bash
cd backend

# (Opcional) Genera el cliente Prisma
npm run db:generate

# (Opcional) Crea/actualiza el esquema en la BD si aún no existe
# npx prisma db push
```

### 5.3 Sembrar los datos iniciales (primera vez)

```bash
cd backend
npm run db:seed
```

Esto crea el usuario **admin** (`admin@selnicsports.com` / `Admin1234!`) y las disciplinas **Fútbol,
Básquetbol y Ajedrez** con sus categorías.

> ⚠️ **Importante:** en entornos no interactivos `prisma migrate dev` puede fallar. Usa
> `npx prisma db push --accept-data-loss` para sincronizar el esquema y `npm run db:seed`
> para los datos iniciales.

### 5.4 Levantar el backend

```bash
cd backend
npm run dev
```

El servidor arranca en **http://localhost:3000** y muestra en consola: *"Conectado a PostgreSQL"*,
*"Servidor corriendo en http://localhost:3000"* y *"Health check: http://localhost:3000/health"*.

### 5.5 Levantar el frontend

```bash
cd frontend
npm run dev
```

La app se sirve en **http://localhost:5173/selnic-sports/** (Vite usa el puerto 5173 por defecto).

---

## 6. Comandos útiles

| Comando                    | Directorio | Descripción |
|----------------------------|------------|-------------|
| `npm run dev`              | backend    | Servidor Express en modo watch (tsx) |
| `npm run dev`              | frontend   | Servidor de desarrollo Vite |
| `npm run db:generate`      | backend    | Genera el cliente Prisma |
| `npm run db:seed`          | backend    | Ejecuta el seed de datos iniciales |
| `npm run db:studio`        | backend    | Abre Prisma Studio (explorar BD) |
| `npx prisma db push`       | backend    | Sincroniza el esquema con la BD |
| `npm run db:migrate`       | backend    | Crea/ejecuta migraciones de Prisma |
| `npm run build`            | frontend   | Compila TypeScript + build de Vite |

---

## 7. Modelo de datos (Prisma)

Fuente de verdad: `backend/prisma/schema.prisma`. Modelos principales:

### 7.1 Multidisciplina
- **`Discipline`** — deporte (Fútbol, Básquetbol, Ajedrez). `id, name, playersPerField`.
- **`Category`** — categoría de una disciplina (`disciplineId` FK).
- **`Team`** — equipo, pertenece a una `Discipline` y una `Category`.
- **`Player`** — jugador, con `disciplineId?` opcional (se deriva/auto-asigna del equipo).
  Campos opcionales de información académica: `educationalUnit`, `educationalLevel`,
  `educationalAddress`.

### 7.2 Partidos e incidencias
- **`Match`** — partido entre `homeTeam` y `awayTeam` de una `category`. Campos de torneo
  opcionales: `tournamentId`, `groupId`, `phase` (`GROUPS`, `ROUND_OF_16`, `QUARTER_FINAL`,
  `SEMI_FINAL`, `THIRD_PLACE`, `FINAL`), `matchDay`, `scheduledTime`.
- **`MatchValidation`** — validación biométrica/presencia de un jugador.
- **`MatchIncident`** — incidencia con `type` según el enum `IncidentType`
  (goles/tarjetas, canastas/rebotes/robos, jaques/mates/tablas, etc.). Incluye `teamId`,
  `assistPlayerId`, `period`, `points` y `quantity` opcionales.

### 7.3 Torneos
- **`Tournament`** — `name`, `disciplineId`, `categoryId`, `formatType`
  (`GROUPS_AND_KNOCKOUT`, `ROUND_ROBIN`), `generationMode` (`AUTOMATIC`, `SEMI_AUTOMATIC`,
  `MANUAL`), `qualifiedPerGroup`, `maxGroups` (configurable), fechas y estado.
- **`Group`** — grupo de un torneo.
- **`TeamGroup`** — relación equipo↔grupo con tabla de posiciones: `points`, `goalsFor`,
  `goalsAgainst`, `wins`, `draws`, `losses`.

### 7.4 Enums relevantes
```prisma
enum IncidentType {
  GOAL YELLOW_CARD RED_CARD CORNER FOUL SUBSTITUTION
  BASKET_2 BASKET_3 FREE_THROW FOUL_BASKET BLOCK TURNOVER TIMEOUT REBOUND ASSIST STEAL
  CHECK CHECKMATE RESIGNATION DRAW_CHESS CAPTURED_PIECE
  NOTE
}
enum MatchPhase { GROUPS ROUND_OF_16 QUARTER_FINAL SEMI_FINAL THIRD_PLACE FINAL }
enum FormatType { GROUPS_AND_KNOCKOUT ROUND_ROBIN }
enum GenerationMode { AUTOMATIC SEMI_AUTOMATIC MANUAL }
```

---

## 8. Endpoints de la API (REST)

Base URL backend: `http://localhost:3000/api`

### Disciplinas
| Método | Ruta                   | Descripción |
|--------|------------------------|-------------|
| GET    | `/disciplines`         | Listar disciplinas |
| POST   | `/disciplines`         | Crear disciplina (admin) |
| PATCH  | `/disciplines/:id`     | Actualizar disciplina (admin) |
| DELETE | `/disciplines/:id`     | Eliminar disciplina (admin) |

### Categorías
| Método | Ruta                        | Descripción |
|--------|-----------------------------|-------------|
| GET    | `/categories?disciplineId=` | Listar categorías (filtradas por disciplina) |
| POST   | `/categories`               | Crear categoría (requiere `name` + `disciplineId`) |
| PATCH  | `/categories/:id`           | Actualizar categoría (parcial: `name` y/o `disciplineId`) |
| DELETE | `/categories/:id`           | Eliminar categoría |

### Equipos
| Método | Ruta               | Descripción |
|--------|--------------------|-------------|
| GET    | `/teams`           | Listar equipos (filtro `categoryId`/`disciplineId`) |
| POST   | `/teams`           | Crear equipo |
| PATCH  | `/teams/:id`       | Actualizar equipo |
| DELETE | `/teams/:id`       | Eliminar equipo |

### Jugadores
| Método | Ruta                       | Descripción |
|--------|----------------------------|-------------|
| GET    | `/players`                 | Listar jugadores (filtro `search`/`teamId`/`disciplineId`) |
| GET    | `/players/:id`             | Detalle de un jugador |
| POST   | `/players`                 | Crear jugador |
| PATCH  | `/players/:id`             | Actualizar jugador |
| DELETE | `/players/:id`             | Eliminar jugador |
| POST   | `/players/:id/photo`       | Subir foto |
| POST   | `/players/:id/biometric`   | Registrar datos biométricos |

### Partidos
| Método | Ruta                        | Descripción |
|--------|-----------------------------|-------------|
| GET    | `/matches?tournamentId=`    | Listar partidos |
| GET    | `/matches/:id`              | Detalle de partido |
| POST   | `/matches`                  | Crear partido |
| POST   | `/matches/:id/validate`     | Validar jugador (biometría) |
| POST   | `/matches/:id/incidents`    | Guardar marcador e incidencias (y actualizar posiciones de grupo) |
| GET    | `/matches/:id/players`      | Jugadores disponibles de ambos equipos |

### Torneos
| Método | Ruta                          | Descripción |
|--------|-------------------------------|-------------|
| GET    | `/tournaments`                | Listar torneos |
| GET    | `/tournaments/:id`            | Detalle de torneo |
| POST   | `/tournaments`                | Crear torneo (genera calendario según el modo) |
| PATCH  | `/tournaments/:id`            | Actualizar torneo (admin) |
| DELETE | `/tournaments/:id`            | Eliminar torneo (admin) |
| GET    | `/tournaments/:id/standings`  | Tabla de posiciones por grupo |
| GET    | `/tournaments/:id/stats`      | Estadísticas (máx. goleador, mejor equipo, etc. por disciplina) |
| GET    | `/tournaments/:id/bracket`    | Datos del bracket (eliminación directa) |

### Usuarios / Auth
| Método | Ruta                     | Descripción |
|--------|--------------------------|-------------|
| POST   | `/auth/login`            | Iniciar sesión |
| GET    | `/admin/users`           | Listar usuarios (admin) |
| POST   | `/admin/users`           | Crear usuario (admin) |
| PATCH  | `/admin/users/:id`       | Actualizar usuario (admin) |

---

## 9. Lógica de negocio destacada

### 9.1 Generación de calendario (`calendar.service.ts`)
- **Round Robin (Berger):** genera la fase de grupos con el calendario de "todos contra todos"
  por grupo.
- **Eliminación directa (knockout):** crea los cruces de octavos, cuartos, semifinal, final y
  tercer puesto según los clasificados de cada grupo.

### 9.2 Actualización de posiciones (`match.service.ts → updateStandings`)
Al finalizar un partido de la **fase de grupos**, se actualiza la fila de `TeamGroup` de ambos
equipos (puntos, goles a favor/en contra, ganados/empatados/perdidos).

### 9.3 Clasificación y estadísticas (`standings.service.ts`, `statistics.service.ts`)
- El sistema calcula la clasificación hacia la eliminatoria **por posición** en la tabla (los
  `qualifiedPerGroup` primeros de cada grupo).
- Estadísticas según disciplina: fútbol (máx. goleador, máx. asistidor, mejor equipo, equipo con
  más goles, menos goles recibidos) y las correspondientes para básquetbol y ajedrez.

### 9.4 Incidencias según disciplina (frontend)
El frontend define un mapa de **etiquetas de incidencias por disciplina** en
`frontend/src/features/matches/utils/incidentLabels.ts`, que se usa tanto en el formulario de
incidencias como en el acta final. El tipo de incidencia se envía al backend y se valida con
Zod contra el enum `IncidentType`.

### 9.5 Validación de alineaciones dinámica
En la validación de jugadores, el umbral de jugadores requerido depende de la **disciplina**
(`playersPerField * 2`, ej. 22 en fútbol, 10 en básquetbol, 2 en ajedrez).

### 9.6 Carnet de jugador con código QR
El sistema genera carnets individuales para cada jugador en formato de tarjeta credencial
(85mm x 55mm). El código QR contiene un JSON con la información básica del jugador:
```json
{
  "name": "Nombre Apellido",
  "documentId": "1234567890",
  "team": "Nombre Equipo",
  "category": "Sub15",
  "discipline": "Fútbol",
  "birthDate": "2010-05-15"
}
```

**Componentes frontend:**
- `PlayerCarnet.tsx` — Renderiza un carnet individual usando `qrcode.react` para generar el QR.
- `BulkCarnetPrint.tsx` — Renderiza múltiples carnets en cuadrícula (2 columnas) para impresión A4.
- `PlayerCarnetPage.tsx` — Página de carnet individual con botón imprimir.
- `BulkCarnetPage.tsx` — Página de impresión masiva con selección múltiple de jugadores.

**Estilos de impresión:** Se usa `@media print` para ocultar la interfaz y mostrar solo los
carnets. Los carnets se distribuyen en grid de 2 columnas para aprovechar el papel A4.

---

## 10. Rutas del frontend (`frontend/src/router.tsx`)

| Ruta                    | Componente                    | Descripción |
|-------------------------|-------------------------------|-------------|
| `/auth/*`               | `AuthRoutes`                  | Login / registro |
| `/`                     | `Dashboard`                   | Panel principal |
| `/teams`                | `TeamsPage`                   | Equipos |
| `/players`              | `PlayersPage`                 | Jugadores |
| `/players/:id/report`   | `PlayerReportPage`            | Reporte de jugador |
| `/players/:id/carnet`   | `PlayerCarnetPage`            | Carnet individual del jugador con QR |
| `/players/bulk-carnets` | `BulkCarnetPage`              | Impresión masiva de carnets |
| `/matches`              | `MatchesPage`                 | Partidos |
| `/matches/:id/flow`     | `MatchFlowPage`               | Flujo de partido (validación/incidencias/ficha) |
| `/disciplines`          | `DisciplinesPage`             | Disciplinas (admin) |
| `/tournaments`          | `TournamentsPage`             | Listado de torneos |
| `/tournaments/create`   | `TournamentCreatePage`        | Crear torneo |
| `/tournaments/:id`      | `TournamentDetailPage`        | Detalle de torneo (grupos, bracket, stats) |
| `/admin/categories`     | `CategoriesPage`              | Categorías (admin) |
| `/admin/users`          | `UsersPage`                   | Usuarios (admin) |

---

## 11. Notas y advertencias para el mantenimiento

1. **Errores de Zod v4 (`required_error`):** parte del código heredado usa `required_error`, que
   fue eliminado en Zod v4. Estos errores de **type-check** (`tsc --noEmit`) no bloquean el
   **runtime** porque el backend corre con `tsx` (sin type-check) y compila con `tsup`/esbuild.
   **Recomendación:** migrar progresivamente los mensajes de error al estilo Zod v4
   (ej. `z.string({ message: "..." })`) para limpiar el type-check.

2. **Migraciones vs `db push`:** el esquema multidisciplina se sincronizó con `npx prisma db push`
   (por el entorno no interactivo). No existe una migración SQL nueva para la estructura
   multidisciplina/torneos. Si necesitas migraciones versionadas, ejecuta `npm run db:migrate` en
   un entorno interactivo y genera la migración correspondiente.

3. **Regenerar el cliente Prisma:** tras cualquier cambio en `schema.prisma`, ejecuta
   `npm run db:generate` para regenerar el cliente en `backend/src/generated/`.

4. **Cambiar la contraseña del admin inicial:** modifica `Admin1234!` en `backend/prisma/seed.ts`
   (y vuelve a ejecutar el seed) o directamente desde el módulo de usuarios.

5. **Base URL del frontend:** el `BrowserRouter` usa el `basename /selnic-sports`. Si despliegas
   en otra ruta, ajusta el `base` en `frontend/vite.config.ts` y el `basename` en `router.tsx`.

6. **Categorías y disciplinas:** el formulario de categorías ahora incluye un selector de
   disciplina obligatorio. La tabla de categorías muestra la columna "Disciplina". El backend
   ya requería `disciplineId` al crear categorías, pero el frontend no lo enviaba anteriormente.

7. **Información académica del jugador:** los campos `educationalUnit`, `educationalLevel` y
   `educationalAddress` son opcionales. Se muestran en el formulario del jugador y se renderizan
   condicionalmente en la ficha (reporte) solo si al menos uno tiene valor.

8. **Código QR en carnets:** se usa la librería `qrcode.react` (instalada en el frontend). Los
   carnets se generan en el cliente sin llamadas a APIs externas. El QR contiene JSON con datos
   básicos del jugador.

---

*Documento técnico asociado al `MANUAL_DE_USUARIO.md`. Actualizado para la funcionalidad
multidisciplina y de torneos.*
