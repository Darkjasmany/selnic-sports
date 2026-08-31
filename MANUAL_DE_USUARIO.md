# 📘 Manual de Usuario — SelNic Sports (Sistema de Gestión Deportiva: Fútbol, Básquetbol y Ajedrez)

Bienvenido al sistema de gestión deportiva **SelNic Sports**. Esta herramienta permite administrar
múltiples disciplinas deportivas — **Fútbol, Básquetbol y Ajedrez** — desde una misma plataforma:
registro de disciplina, categorías, equipos, jugadores, partidos y **torneos con fases de grupos y
eliminación directa (formato tipo Mundial)**.

---

## 1. Acceso al sistema

1. Asegúrate de que el **backend** y el **frontend** estén corriendo (ver el Manual Técnico, sección *"Cómo levantar el sistema"*).
2. Abre tu navegador en: **http://localhost:5173/selnic-sports/**
3. Introduce tus credenciales (usuario administrador creado en la base de datos):

| Campo     | Valor por defecto          |
|-----------|----------------------------|
| Email     | `admin@selnicsports.com`   |
| Contraseña| `Admin1234!`               |

> ⚠️ **Importante:** cambia la contraseña por defecto tras la primera sesión por seguridad.

---

## 2. Navegación general

El menú lateral (Sidebar) contiene los módulos disponibles. Dependiendo de tu rol
(Administrador u Operador) podrás ver más o menos opciones:

| Módulo         | Acceso          | Descripción |
|----------------|-----------------|-------------|
| 🏠 Dashboard   | Todos           | Resumen general del sistema |
| 👥 Jugadores   | Todos           | Registro y gestión de jugadores |
| 🏆 Equipos     | Todos           | Registro y gestión de equipos por categoría y disciplina |
| ⚽ Partidos    | Todos           | Creación de partidos y flujo de validación/incidencias |
| 🏆 Torneos     | Todos           | Creación y gestión de torneos con grupos y eliminación |
| ⚙️ Usuarios    | Solo Admin      | Gestión de usuarios del sistema |
| 🏅 Disciplinas | Solo Admin      | Gestión de disciplinas deportivas |
| 🏷️ Categorías | Solo Admin      | Gestión de categorías por disciplina |

---

## 3. Módulo de Disciplinas (Administrador)

En este módulo se registran los deportes que el sistema soportará.

1. Ve a **Disciplinas** en el menú lateral.
2. Pulsa **+ Nueva disciplina**.
3. Introduce el **nombre** (Fútbol, Básquetbol, Ajedrez, etc.) y el **número de jugadores por
   cancha/campo** (ej. fútbol = 11, básquetbol = 5, ajedrez = 1).
4. Guarda.

> El sistema ya viene con **Fútbol, Básquetbol y Ajedrez** creados por defecto (seed).

---

## 4. Módulo de Categorías (Administrador)

Las categorías se organizan **por disciplina**. Ejemplo:
- **Fútbol:** Sub-12, Sub-15, Sub-18, Mayores.
- **Básquetbol:** Sub-14, Sub-17, Sub-21, Mayores.
- **Ajedrez:** Sub-12, Sub-16, Absoluta.

1. Ve a **Categorías**.
2. Selecciona la **disciplina** a la que pertenece.
3. Pulsa **+ Nueva categoría** e introduce el nombre.
4. Guarda.

---

## 5. Módulo de Equipos

Los equipos pertenecen a una **disciplina** y a una **categoría**.

1. Ve a **Equipos**.
2. (Opcional) Filtra por disciplina en el selector superior.
3. Pulsa **+ Nuevo equipo**.
4. Completa el formulario:
   - **Nombre del equipo** *(obligatorio)*
   - **Disciplina** *(obligatorio, por ejemplo Fútbol)*
   - **Categoría** *(obligatorio, se desbloquea al elegir disciplina)*
   - **Lugar**, **Teléfono del representante** y **DT** *(opcionales)*
5. Guarda.

En la tabla verás el número de **jugadores activos** y el **total registrado** por equipo.

---

## 6. Módulo de Jugadores

1. Ve a **Jugadores**.
2. (Opcional) Filtra por disciplina.
3. Pulsa **+ Nuevo jugador**.
4. Completa las secciones:
   - **Información personal:** apellidos, nombres, cédula/DNI, fecha de nacimiento, teléfono,
     tipo de sangre, dirección.
   - **Filiación deportiva:** elige la **disciplina** y luego el **equipo y categoría**.
   - **Representante legal:** nombres, parentesco, teléfono y correo (contacto de emergencia).
   - **Foto del jugador:** opcional (JPG, PNG o WebP, máximo 5 MB).
5. Guarda.

> Cada jugador pertenece a una disciplina (heredada del equipo). Un jugador desactivado
> (**Jugador Activo** = off) no aparece en las listas de partidos.

### 📄 Reporte del jugador
Desde la tabla puedes abrir el **reporte** de un jugador (`/players/:id/report`) para ver sus
datos completos e historial.

---

## 7. Módulo de Partidos

### 7.1 Crear un partido
1. Ve a **Partidos** → **+ Nuevo partido**.
2. Selecciona en orden (cascada):
   - **Disciplina**
   - **Categoría**
   - **Equipo local** y **Equipo visitante** (de la misma categoría y disciplina).
   - **Fecha y hora**.
   - Observaciones (opcional).
3. Guarda. El partido queda en estado **"Validando jugadores"**.

### 7.2 Flujo de validación e incidencias
Al abrir un partido (`/matches/:id/flow`) pasarás por 3 pasos:

1. **Validar jugadores** — se confirma la presencia de los jugadores (locales y visitantes) de cada
   equipo mediante verificación biométrica si está disponible. Cuando se validan todos los jugadores
   del campo (según la disciplina: 22 en fútbol, 10 en básquetbol, 2 en ajedrez) el partido pasa a
   **En progreso**.
2. **Incidencias** — registra las incidencias del partido. **Las opciones cambian según la disciplina**:
   - **Fútbol:** gol, tarjeta amarilla/roja, corner, falta, cambio.
   - **Básquetbol:** doble (2 pts), triple (3 pts), tiro libre, falta, rebote, asistencia, robo,
     bloqueo, pérdida, tiempo muerto, cambio.
   - **Ajedrez:** jaque, jaque mate, rendición, tablas, pieza capturada.
   
   Introduce también el **marcador final** y las observaciones.
3. **Ficha final** — vista del acta del partido con opción de **imprimir**.

> Cuando un partido pertenece a la **fase de grupos** de un torneo, el resultado actualiza
> automáticamente la tabla de posiciones del grupo.

---

## 8. Módulo de Torneos 🏆

Este es el módulo central de la nueva funcionalidad. Permite gestionar torneos con **formato tipo
Mundial**: fase de **grupos (round robin)** y posteriormente **eliminación directa** (octavos,
cuartos, semifinal, final y tercer puesto).

### 8.1 Crear un torneo
1. Ve a **Torneos** → **+ Nuevo torneo**.
2. Completa el formulario:
   - **Nombre del torneo** *(obligatorio)*.
   - **Disciplina** y **Categoría** *(obligatorios)*.
   - **Formato:**
     - **Grupos + Eliminación directa** (tipo Mundial).
     - **Todos contra todos** (Round Robin simple).
   - **Modo de generación del calendario:**
     - **Automático (check)** — el sistema genera los partidos automáticamente a partir de los
       equipos seleccionados.
     - **Semi-automático** — el sistema sugiere el calendario y el organizador lo ajusta.
     - **Manual con asistencia** — el organizador arma los partidos con ayuda del sistema.
   - **Nº de grupos** (configurable, ej. 4).
   - **Clasificados por grupo** (para eliminatoria, ej. 2).
3. En modo **Automático** selecciona los **equipos** participantes.
4. Crea el torneo.

### 8.2 Detalle del torneo
Al abrir un torneo (`/tournaments/:id`) podrás ver:
- **Datos del torneo:** formato, modo de generación, categoría, fechas y estado.
- **Grupos:** distribución de equipos y **tablas de posiciones** de cada grupo (puntos, ganados,
  empatados, perdidos, goles a favor/en contra, diferencia).
- **Calendario / Partidos:** los partidos programados por fase.
- **Eliminatoria (Bracket):** un **diagrama en forma de árbol** que muestra el cruce de octavos,
  cuartos, semifinal, final y tercer puesto.
- **Estadísticas** (`/tournaments/:id/stats`): los mejores jugadores y equipos de la disciplina.

> Al finalizar los partidos de grupo, el sistema calcula la **clasificación** hacia la eliminatoria
> (por puntos y posición) según la configuración del torneo.

---

## 9. Dashboard

Vista de resumen con indicadores generales de los datos registrados en el sistema
(jugadores, equipos, partidos, torneos, etc.).

---

## 10. Consejos y buenas prácticas

- Registra primero las **disciplinas**, luego las **categorías**, después los **equipos** y por
  último los **jugadores**.
- Valida que los equipos de un partido pertenezcan a la **misma disciplina y categoría**.
- Para los torneos, verifica que el número de equipos sea coherente con el número de grupos y
  clasificados configurados.
- Cierra siempre la sesión cuando termines de usar el sistema en un equipo compartido.

---

## 11. Solución de problemas comunes

| Problema | Posible causa | Solución |
|----------|---------------|----------|
| No carga la página | Backend apagado | Levanta el servidor (ver Manual Técnico) |
| "Credenciales inválidas" | Usuario/contraseña incorrectos | Verifica credenciales o contacta al admin |
| No aparecen categorías | Falta seleccionar disciplina | Elige primero la disciplina (cascada) |
| No aparecen equipos | Falta seleccionar categoría/disciplina | Elige primero disciplina y categoría |
| No puedo eliminar un equipo | Tiene jugadores asociados | Retira los jugadores primero |

---

*Documento generado para el sistema **SelNic Sports**. Si necesitas más detalle técnico, consulta
el `MANUAL_TECNICO.md`.*
