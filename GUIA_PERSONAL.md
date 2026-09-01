# SELNIC SPORTS — GUÍA PERSONAL DE REFERENCIA

> Documento personal de referencia (NO es manual de usuario ni técnico).
> Contiene comandos, estructura de BD, módulos, rutas del API, flujos operativos y utilidades internas.

---

## 1. CÓMO LEVANTAR EL SISTEMA

### Pre-requisitos
- Node.js (usado v25)
- PostgreSQL (BD local)
- npm (backend usa `tsx`, frontend usa `vite`)

### Arrancar Backend
```bash
cd backend
npm install              # solo la primera vez
npm run dev              # tsx --env-file=.env --watch src/server.ts
```
- Arranca en `http://localhost:3000`
- Antes de arrancar conecta a PostgreSQL (`prisma.$connect()`)
- Health check: `http://localhost:3000/health`

### Arrancar Frontend
```bash
cd frontend
npm install              # solo la primera vez
npm run dev              # vite
```
- Arranca en `http://localhost:5173`
- URL de la app: `http://localhost:5173/selnic-sports/` (base configurado)

### Credenciales por defecto
| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `admin@selnicsports.com` | `Admin1234!` |

### Variables de entorno
- Backend: `backend/.env` → contiene `DATABASE_URL`, `PORT`, `JWT_SECRET`, `NODE_ENV`
- Frontend: `frontend/.env` → `VITE_API_URL` (default `http://localhost:3000/api`)

---

## 2. BASE DE DATOS & PRISMA

Todos los comandos se ejecutan dentro de `backend/`.

| Comando | Acción |
|---------|--------|
| `npm run db:generate` | Regenera el cliente Prisma (`npx prisma generate`) |
| `npm run db:migrate` | Crea/ejecuta una migración de BD |
| `npm run db:studio` | Abre Prisma Studio (editor visual de la BD) |
| `npm run db:seed` | Ejecuta el seed de configuración inicial |
| `npm run db:seed:demo` | Ejecuta el seed demo (con jugadores) |
| `npx prisma db push` | Sincroniza el schema con la BD (sin historial de migraciones) |

### Recrear la base desde cero
```bash
cd backend
npx prisma migrate reset --force   # elimina BD, la recrea y aplica seeds
```
Si usas `db push` (sin migraciones):
```bash
npx prisma db push                 # aplica el schema actual
npm run db:seed:demo               # carga admin + disciplinas + categorías + equipos + jugadores
```

### Archivos clave de Prisma
- `backend/prisma/schema.prisma` → modelo de datos
- `backend/prisma/seed.ts` → seed configuración inicial
- `backend/prisma/seed-demo.ts` → seed demo con jugadores
- `backend/src/generated/prisma/` → cliente generado (no editar a mano)

> ⚠️ Si modificas `schema.prisma` cuando la BD está apagada, ejecuta `prisma db push` 
> cuando la BD esté disponible para aplicar el cambio.

---

## 3. SEEDS

### `npm run db:seed` — Configuración inicial (producción)
Crea:
- Admin user
- 3 disciplinas: Fútbol (11 por campo), Básquetbol (5), Ajedrez (1)
- Categorías por disciplina (Sub12..Mayores según disciplina)
- Equipos base (Real Madrid, Barcelona, Liga de Quito, Emelec / Lakers, Celtics)

### `npm run db:seed:demo` — Datos demo (pruebas)
Hace todo lo anterior **más**:
- Ajusta equipos de Ajedrez a 5 clubes por categoría (Alfil, Torre, Dama, Caballo, Rey)
- Mantiene Fútbol solo Mayores y Básquetbol solo Mayores
- Crea **156 jugadores** con nombres ecuatorianos:
  - Fútbol: 4 equipos × 18 jugadores (11 titulares + 7 suplentes) = 72
  - Básquetbol: 2 equipos × 12 jugadores (5 + 7) = 24
  - Ajedrez: 15 equipos × 4 tableros = 60
- Asigna jugadores a equipos vía relación `TeamPlayer`

### Cargar TU cara en los jugadores (demo)
Usa el script SQL `cargar_cara_demo.sql` (raíz). Pone tu descriptor facial
en todos los jugadores que NO tienen biometría. Ver sección 10.

---

## 4. MODELO DE DATOS (resumen)

Modelos definidos en `backend/prisma/schema.prisma` y enums:

- **User** — login, rol (ADMIN/ORGANIZER), activo
- **Discipline** — nombre, jugadores por campo, máx. sustituciones, permite empate
- **Category** — pertenece a disciplina (`@@unique(disciplineId, name)`)
- **Team** — pertenece a disciplina+categoría (`@@unique(disciplineId, categoryId, name)`), coach, ubicación
- **Player** — datos personales, disciplina opcional, tutor, info académica, `biometricData` (jsonb), `biometricType`
- **TeamPlayer** — relación player↔team (`@@unique(teamId, playerId)`)
- **Tournament** — formato, modo generación, clasificados por grupo, fechas
- **Group** — grupos del torneo (`Group A`, `Group B`...)
- **TeamGroup** — equipo dentro de grupo (posición, puntos, goles, wins/draws/losses)
- **Match** — local/visitante, categoría, fase, jornada, resultado
- **MatchValidation** — jugador validado en un partido (validación biométrica)
- **MatchIncident** — goles, tarjetas, faltas, etc.

### Enums importantes
- `Role`: ADMIN, ORGANIZER
- `BiometricType`: FACIAL, FINGERPRINT
- `MatchStatus`: PENDING, VALIDATING_PLAYERS, IN_PROGRESS, FINISHED, CANCELLED
- `MatchPhase`: GROUPS, ROUND_OF_16, QUARTER_FINAL, SEMI_FINAL, THIRD_PLACE, FINAL
- `TeamSide`: HOME, AWAY
- `FormatType`: GROUPS_AND_KNOCKOUT, KNOCKOUT_ONLY, ROUND_ROBIN
- `GenerationMode`: AUTOMATIC, SEMI_AUTOMATIC, MANUAL
- `IncidentType`: GOAL, YELLOW_CARD, RED_CARD, CORNER, FOUL, SUBSTITUTION, BASKET_2/3, FREE_THROW, CHECK, CHECKMATE, RESIGNATION, etc.

---

## 5. MÓDULOS DEL BACKEND

Cada módulo vive en `backend/src/modules/<nombre>/` con la estructura:
`*.router.ts` (rutas Express) → `*.controller.ts` (handler) → `*.service.ts` (lógica/Prisma) → `*.schema.ts` (validación Zod)

| Módulo | Carpeta | Router | Propósito |
|--------|---------|--------|-----------|
| Auth | `auth/` | `auth.router.ts` | login, registro, perfil |
| Admin/Usuarios | `admin/` | `admin.router.ts` | gestión de usuarios (solo ADMIN) |
| Disciplinas | `disciplines/` | `discipline.router.ts` | CRUD disciplinas |
| Categorías | `categories/` | `category.router.ts` | CRUD categorías |
| Equipos | `teams/` | `team.router.ts` | CRUD equipos |
| Jugadores | `players/` | `player.router.ts` | CRUD jugadores, foto, biometría |
| Partidos | `matches/` | `match.router.ts` | CRUD partidos, validación, incidentes |
| Torneos | `tournaments/` | `tournament.router.ts` | CRUD torneos, posiciones, stats, bracket |

### Servicios auxiliares de torneos
- `calendar.service.ts` → genera Round Robin (Berger) para grupos y emparejamientos de eliminación
- `standings.service.ts` → tabla de posiciones por grupo
- `statistics.service.ts` → estadísticas del torneo y bracket

### Middlewares
- `middlewares/auth.middleware.js` → `authenticate`, `authorize(role)`
- `middlewares/validate.middleware.js` → `validateBody(schema)`
- `middlewares/error.middleware.js` → `errorMiddleware`, `AppError`

---

## 6. RUTAS DEL API

Prefijo base: `http://localhost:3000` (ver `backend/src/app.ts`)

### Auth — `/api/auth`
| Método | Ruta | Protección | Body |
|--------|------|-----------|------|
| POST | `/login` | pública | email, password |
| POST | `/register` | authenticate | email, password |
| GET | `/profile` | authenticate | — |

### Admin/Usuarios — `/api/admin/users` (solo ADMIN)
| Método | Ruta | Body |
|--------|------|------|
| GET | `/` | — |
| GET | `/:id` | — |
| POST | `/` | createUser |
| PATCH | `/:id` | updateUser |
| PATCH | `/:id/password` | changePassword |
| PATCH | `/:id/deleted` | soft delete |
| DELETE | `/:id` | delete definitivo |

### Disciplinas — `/api/disciplines` (CRUD solo ADMIN)
| Método | Ruta |
|--------|------|
| GET | `/` , `/:id` |
| POST | `/` |
| PATCH | `/:id` |
| DELETE | `/:id` |

### Categorías — `/api/categories` (CRUD solo ADMIN)
| Método | Ruta |
|--------|------|
| GET | `/` , `/:id` |
| POST | `/` |
| PATCH | `/:id` |
| DELETE | `/:id` |

### Equipos — `/api/teams` (CRUD solo ADMIN)
| Método | Ruta |
|--------|------|
| GET | `/` , `/:id` (acepta `?categoryId=` y `?disciplineId=`) |
| POST | `/` |
| PATCH | `/:id` |
| DELETE | `/:id` |

### Jugadores — `/api/players`
| Método | Ruta | Body / Notas |
|--------|------|-------------|
| GET | `/` , `/:id` | |
| POST | `/` | createPlayer (incluye teamId, disciplineId, tutor, info académica) |
| PATCH | `/:id` | updatePlayer |
| POST | `/:id/biometric` | `{ biometricData: number[], biometricType }` |
| POST | `/:id/photo` | foto (multipart `photo`) |
| DELETE | `/:id` | |

### Partidos — `/api/matches`
| Método | Ruta | Body / Notas |
|--------|------|-------------|
| GET | `/` , `/:id` | |
| GET | `/:id/players` | jugadores del partido |
| POST | `/` | createMatch (homeTeamId, awayTeamId, categoryId, scheduledAt, tournamentId?, groupId?, phase?, matchDay?) |
| POST | `/:id/validate` | `{ playerId, teamSide, biometricDescriptor }` → valida jugador |
| POST | `/:id/incidents` | `{ homeScore, awayScore, notes?, incidents[] }` |

### Torneos — `/api/tournaments` (CRUD solo ADMIN)
| Método | Ruta | Notas |
|--------|------|-------|
| GET | `/` , `/:id` | |
| GET | `/:id/standings` | tabla de posiciones por grupo |
| GET | `/:id/stats` | estadísticas |
| GET | `/:id/bracket` | bracket de eliminación |
| POST | `/` | createTournament (name, disciplineId, categoryId, formatType, generationMode, qualifiedPerGroup, maxGroups, startDate?, endDate?, teamIds?) |
| PATCH | `/:id` | updateTournament |
| DELETE | `/:id` | |

### Otros
- `GET /health` → verificación del servidor
- `GET /uploads/*` → fotos estáticas de jugadores

---

## 7. FRONTEND

### Rutas (router.tsx, basename `/selnic-sports`)
```tsx
<BrowserRouter basename="/selnic-sports">
```
| Ruta | Página |
|------|--------|
| `/auth/*` | AuthRoutes (login/register) |
| `/` | Dashboard |
| `/teams` | TeamsPage |
| `/players` | PlayersPage |
| `/players/:id/report` | PlayerReportPage (reporte, botón Carnet) |
| `/players/:id/carnet` | PlayerCarnetPage (carnet individual con QR) |
| `/players/bulk-carnets` | BulkCarnetPage (impresión masiva con QR) |
| `/matches` | MatchesPage |
| `/matches/:id/flow` | MatchFlowPage (flujo de partido: validación→incidentes→reporte) |
| `/disciplines` | DisciplinesPage |
| `/tournaments` | TournamentsPage |
| `/tournaments/create` | TournamentCreatePage |
| `/tournaments/:id` | TournamentDetailPage |
| `/admin/categories` | CategoriesPage |
| `/admin/users` | UsersPage |

### Estructura de features
```
frontend/src/
  api/                  client.ts (axios), utils.ts
  features/
    auth/               login, store
    admin/              gestión de usuarios
    biometric/          reconocimiento facial (face-api.js)
    categories/         categorías
    disciplines/        disciplinas
    matches/            partidos + flujo (steps: StepValidation, StepIncidents, StepReport)
    players/            jugadores, reportes, carnets
    teams/              equipos
    tournaments/        torneos (create, detail, bracket)
  layouts/  pages/  store/  utils/  router.tsx
```

### Partidos — flujo (MatchFlowPage)
- `StepValidation.tsx` → valida jugadores (validación biométrica facial)
- `StepIncidents.tsx` → registra incidentes del partido
- `StepReport.tsx` → reporte final del partido
- `MatchStepper.tsx` → stepper entre pasos
- `PlayerCard.tsx` → tarjeta de jugador

### Biometría (reconocimiento facial)
- `features/biometric/utils/faceUtils.ts` → `loadFaceApiModels` (carga modelos), `captureDescriptorFromVideo`, `matchPercentage`, `isSamePerson`
- Modelos servidos desde `public/models/` → URL usa `import.meta.env.BASE_URL` (ahora `/selnic-sports/models`)
- `features/biometric/api/biometric.api.ts` → `saveBiometric` (POST `/api/players/:id/biometric`)

---

## 8. FLUJO COMPLETO DE USO (paso a paso)

### A. Registrar equipos
1. Menú → **Equipos**
2. Crear equipo: seleccionar **disciplina** → **categoría** → nombre → coach
3. Necesitas al menos un equipo por categoría para asignar jugadores

### B. Registrar jugadores
1. Menú → **Jugadores** → **Nuevo jugador**
2. Llenar secciones (formulario de una columna, modal grande `max-w-5xl`):
   - **Personal**: nombres, cédula, fecha de nacimiento, teléfono, dirección, tipo de sangre
   - **Foto**: subir foto del jugador
   - **Filiación Deportiva**: disciplina → **equipo/categoría** (aquí se asigna el equipo)
   - **Representante**: tutor (nombre, teléfono, email, parentesco)
   - **Académica** (opcional): unidad educativa, nivel, dirección
3. Guardar. El jugador queda asignado al equipo vía `TeamPlayer`.

### C. Registrar biometría (rostro)
1. Abrir el jugador → registrar biometría facial (cámara)
2. El frontend captura el descriptor y lo envía a `POST /api/players/:id/biometric`
3. Queda guardado en `biometricData` (jsonb, 128 números)
> Para probar sin capturar cada cara, usa `cargar_cara_demo.sql` (sección 10).

### D. Crear campeonato (torneo)
1. Menú → **Torneos** → **Crear torneo** (`/tournaments/create`)
2. Configurar:
   - Nombre
   - **Disciplina** (Fútbol/Básquetbol/Ajedrez)
   - **Categoría** (ej. Mayores) — debe coincidir con la disciplina
   - **Formato**: `GROUPS_AND_KNOCKOUT`, `KNOCKOUT_ONLY`, `ROUND_ROBIN`
   - **Modo generación**: `AUTOMATIC`, `SEMI_AUTOMATIC`, `MANUAL`
   - **Clasificados por grupo** (`qualifiedPerGroup`, default 2)
   - **Máx. grupos** (`maxGroups`, default 4)
   - Fechas inicio/fin
   - **Equipos** (`teamIds`) — se listan los del torneo

### E. Configurar grupos
- Al crear el torneo con formato de grupos, el sistema crea automáticamente los grupos: `Group A`, `Group B`, `Group C`, `Group D` (según `maxGroups`).
- Los equipos se distribuyen en los grupos de forma redonda/equilibrada.
- Modo `SEMI_AUTOMATIC` / `MANUAL`: el organizador asigna equipos a grupos manualmente.

### F. Generar calendario
- **Automático** (`generationMode: AUTOMATIC` + `formatType: GROUPS_AND_KNOCKOUT`):
  - `generateGroupPhase` (calendar.service.ts) genera los partidos de grupos con Round Robin (algoritmo de Berger).
  - Cada jornada suma +7 días desde `startDate`.
  - Los partidos se crean con `phase: GROUPS`, `matchDay: 1..n`, `status: PENDING`.
- **Knockout** (`generateKnockoutPhase`): genera cuartos/semis/final según `knockoutPhases`.
- Si el modo es `MANUAL`/`SEMI_AUTOMATIC`, creas los partidos manualmente desde el módulo Partidos.

### G. Validar jugadores en un partido (validación biométrica)
1. Menú → **Partidos** → abrir el partido → **Flujo** (`/matches/:id/flow`)
2. En **Paso Validación**: por cada jugador (equipo local/visitante) se valida con la cámara.
   - El frontend compara el descriptor capturado con el del jugador.
   - Si coincide, `POST /api/matches/:id/validate` guarda la `MatchValidation`.
3. Cuando se validan los necesarios (`playersPerField * 2`, ej. 22 en fútbol), el backend cambia el estado del partido.

### H. Registrar incidentes
1. En el flujo → **Paso Incidentes**
2. Registra goles, tarjetas, faltas, etc. según disciplina
3. Guarda `POST /api/matches/:id/incidents` con marcador final

### I. Reportes y carnets
- **Reporte jugador**: `/players/:id/report` → botón para carnet
- **Carnet individual**: `/players/:id/carnet` → tarjeta con QR + imprimir
- **Carnets masivos**: `/players/bulk-carnets` → selección por checkboxes + filtro de disciplina, imprime cuadrícula A4 de 2 columnas
- El QR contiene JSON: `{ name, documentId, team, category, discipline, birthDate }`

### J. Posiciones / bracket
- Torneo → `/tournaments/:id` → pestañas de posiciones (`GET /:id/standings`) y bracket (`GET /:id/bracket`)

---

## 9. VALIDACIÓN BIOMÉTRICA (explicación)

- **face-api.js** detecta el rostro (ssdMobilenetv1), extrae landmarks y genera un **descriptor de 128 números**.
- El descriptor se guarda en `Player.biometricData` (jsonb).
- **Frontend** (`faceUtils.ts`):
  - `loadFaceApiModels` → carga modelos desde `BASE_URL/models`
  - `captureDescriptorFromVideo` → toma array de 128 números
  - `euclideanDistance`, `matchPercentage`, `isSamePerson` → compara descriptores
- **Backend** (`match.service.ts:148-154`):
  - Verifica que el jugador tenga `biometricData`
  - El comentario indica que la comparación de descriptores real **aún está pendiente** — por ahora guarda la validación directamente (el frontend compara antes de llamar al endpoint).

> ⚠️ Si quieres activar la comparación **en el backend** (seguridad real), hay que implementarla
> en `match.service.ts` donde está el placeholder. Actualmente la comparación la hace el frontend.

### Umbral de coincidencia
- `isSamePerson(distance, threshold = 0.55)` → devuelve true si distancia < 0.55
- `matchPercentage = (1 - distance) * 100`

---

## 10. SCRIPT SQL PARA CARGA DE CARA DEMO

Archivo en la raíz: **`cargar_cara_demo.sql`**

Propósito: cargar TU descriptor facial en todos los jugadores que NO tienen biometría,
para que la validación biométrica en partidos funcione sin capturar cada rostro.

### Ejecutar
```bash
# Reemplaza TU_DATABASE_URL por el valor de DATABASE_URL en backend/.env
psql "TU_DATABASE_URL" -f cargar_cara_demo.sql

# O abre Prisma Studio y edita manualmente el campo biometricData
cd backend && npm run db:studio
```

### Qué hace
1. Muestra qué jugadores tienen / no tienen biometría (SELECT)
2. `UPDATE "Player" SET "biometricData" = '<128 números>'::jsonb, "biometricType" = 'FACIAL' WHERE "biometricData" IS NULL`
   - Solo afecta jugadores **sin** biometría (NO sobrescribe los existentes)
3. Verificación: muestra cuántos quedaron con biometría y la dimensión (debe ser 128)
4. Al final incluye el comando para **revertir** (poner todo a NULL)

### ⚠️ ADVERTENCIA
- **Solo para prueba/demo.** Pone tu mismo rostro en todos los jugadores.
- En producción cada jugador debe tener su propio descriptor (registrado desde la cámara).
- No sobrescribe jugadores que ya tengan biometría (por seguridad).

---

## 11. NOTAS / PROBLEMAS CONOCIDOS

- **Base de datos:** Si `prisma db push` falla por BD apagada, la aplicación no usa el schema actualizado hasta que la BD esté disponible y se ejecute el push.
- **Zod v4:** El backend tiene errores de TypeScript pre-existentes (Zod v4 compatibility en `required_error`). No impiden correr `npm run dev` (tsx), pero `tsc --noEmit` los muestra. Son del proyecto, no de los cambios nuevos.
- **ESLint:** hay un conflicto de plugin pre-existente.
- **Base del frontend:** `/selnic-sports/` — afecta a rutas y a los modelos de biometría (ya corregido con `BASE_URL`).
- **Seeds:** `db:seed` (producción) y `db:seed:demo` (demo) son independientes. El demo crea 156 jugadores.
