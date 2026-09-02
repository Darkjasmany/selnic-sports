import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "@/app";
import { prisma } from "@/config/database";
import { unique, authHeader } from "./helpers";

// Pruebas de integración contra el servidor Express real (supertest) y la BD de
// desarrollo. Cada test crea sus propios datos (nombres únicos) y los limpia al
// final, de modo que no se contamina la información existente.

const loginBody = (email: string, password: string) => ({ email, password });

let adminToken: string;
let auth: Record<string, string>;
let disciplineId = "";
let categoryId = "";
const teamIds: string[] = [];
let playerId = "";
let tournamentId = "";
let createdMatchId = "";

const suffix = unique("it");

beforeAll(async () => {
  // 1) Login como ADMIN (usuario del seed)
  const login = await request(app)
    .post("/api/auth/login")
    .send(loginBody("admin@selnicsports.com", "Admin1234!"));
  expect(login.status).toBe(200);
  expect(login.body.success).toBe(true);
  expect(login.body.data.user.role).toBe("ADMIN");
  adminToken = login.body.data.token;
  auth = authHeader(adminToken);

  // 2) Crear disciplina única
  const disc = await request(app)
    .post("/api/disciplines")
    .set(auth)
    .send({ name: `Disciplina ${suffix}`, playersPerField: 5 });
  expect(disc.status).toBe(201);
  disciplineId = disc.body.data.id;

  // 3) Crear categoría única en esa disciplina
  const cat = await request(app)
    .post("/api/categories")
    .set(auth)
    .send({ name: `Categoría ${suffix}`, disciplineId });
  expect(cat.status).toBe(201);
  categoryId = cat.body.data.id;

  // 4) Crear 4 equipos
  for (let i = 1; i <= 4; i++) {
    const team = await request(app)
      .post("/api/teams")
      .set(auth)
      .send({
        name: `${suffix} Equipo ${i}`,
        disciplineId,
        categoryId,
        coachName: `Coach ${i}`,
      });
    expect(team.status).toBe(201);
    teamIds.push(team.body.data.id);
  }

  // 5) Crear torneo en modo AUTOMATICO con los 4 equipos (formato grupos+knockout)
  const t = await request(app)
    .post("/api/tournaments")
    .set(auth)
    .send({
      name: `Torneo ${suffix}`,
      disciplineId,
      categoryId,
      formatType: "GROUPS_AND_KNOCKOUT",
      generationMode: "AUTOMATIC",
      qualifiedPerGroup: 2,
      maxGroups: 1,
      teamIds,
    });
  expect(t.status).toBe(201);
  tournamentId = t.body.data.id;
});

afterAll(async () => {
  // Limpieza en orden inverso de dependencias
  if (tournamentId) {
    await request(app).delete(`/api/tournaments/${tournamentId}`).set(auth);
  }
  if (playerId) {
    // El service no elimina los TeamPlayer asociados, por lo que hay que
    // limpiarlos manualmente antes de borrar el jugador.
    await prisma.teamPlayer.deleteMany({ where: { playerId } });
    await request(app).delete(`/api/players/${playerId}`).set(auth);
  }
  for (const id of teamIds) {
    await request(app).delete(`/api/teams/${id}`).set(auth);
  }
  if (categoryId) {
    await request(app).delete(`/api/categories/${categoryId}`).set(auth);
  }
  if (disciplineId) {
    await request(app).delete(`/api/disciplines/${disciplineId}`).set(auth);
  }
  await prisma.$disconnect();
});

describe("Auth", () => {
  it("rechaza credenciales incorrectas con 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send(loginBody("admin@selnicsports.com", "mala-password"));
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("bloquea endpoints privados sin token (401)", async () => {
    const res = await request(app).get("/api/disciplines");
    expect(res.status).toBe(401);
  });

  it("devuelve el perfil del usuario autenticado", async () => {
    const res = await request(app).get("/api/auth/profile").set(auth);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe("admin@selnicsports.com");
  });
});

describe("Disciplinas y categorías", () => {
  it("lista disciplinas autenticado", async () => {
    const res = await request(app).get("/api/disciplines").set(auth);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.some((d: any) => d.id === disciplineId)).toBe(true);
  });

  it("lista y filtra categorías por disciplina", async () => {
    const res = await request(app)
      .get(`/api/categories?disciplineId=${disciplineId}`)
      .set(auth);
    expect(res.status).toBe(200);
    const found = res.body.data.find((c: any) => c.id === categoryId);
    expect(found).toBeDefined();
    expect(found.disciplineId).toBe(disciplineId);
  });
});

describe("Equipos", () => {
  it("lista equipos creados", async () => {
    const res = await request(app).get("/api/teams").set(auth);
    expect(res.status).toBe(200);
    for (const id of teamIds) {
      expect(res.body.data.some((t: any) => t.id === id)).toBe(true);
    }
  });

  it("filtra equipos por categoría y disciplina", async () => {
    const res = await request(app)
      .get(`/api/teams?categoryId=${categoryId}&disciplineId=${disciplineId}`)
      .set(auth);
    expect(res.status).toBe(200);
    expect(res.body.data.every((t: any) => t.categoryId === categoryId)).toBe(true);
  });
});

describe("Jugadores", () => {
  it("crea un jugador y lo recupera", async () => {
    const created = await request(app).post("/api/players").set(auth).send({
      firstName: `Juan ${suffix}`,
      lastName: `Pérez ${suffix}`,
      birthDate: "2010-05-15",
      documentId: `${suffix.slice(-6)}1234`,
      teamId: teamIds[0],
      phone: "0999999999",
    });
    expect(created.status).toBe(201);
    playerId = created.body.data.id;

    const got = await request(app).get(`/api/players/${playerId}`).set(auth);
    expect(got.status).toBe(200);
    expect(got.body.data.id).toBe(playerId);
  });

  it("guarda el descriptor biométrico del jugador", async () => {
    expect(playerId).toBeTruthy();
    const res = await request(app)
      .post(`/api/players/${playerId}/biometric`)
      .set(auth)
      .send({ biometricData: [0.1, 0.2, 0.3, 0.4], biometricType: "FACIAL" });
    expect(res.status).toBe(200);
    expect(res.body.data.biometricData).toEqual([0.1, 0.2, 0.3, 0.4]);
  });
});

describe("Torneos — integridad con equipos (bug)", () => {
  it("devuelve el torneo con sus grupos y equipos asignados", async () => {
    const res = await request(app).get(`/api/tournaments/${tournamentId}`).set(auth);
    expect(res.status).toBe(200);
    const t = res.body.data;
    expect(Array.isArray(t.groups)).toBe(true);
    // Debe haber al menos un grupo con teamGroups asignados
    const groupWithTeams = t.groups.find(
      (g: any) => Array.isArray(g.teamGroups) && g.teamGroups.length > 0
    );
    expect(groupWithTeams).toBeDefined();
    expect(groupWithTeams.teamGroups.length).toBeGreaterThan(0);
  });

  it("los equipos aparecen en la tabla de posiciones (standings)", async () => {
    const res = await request(app)
      .get(`/api/tournaments/${tournamentId}/standings`)
      .set(auth);
    expect(res.status).toBe(200);
    const groups = res.body.data;
    expect(Array.isArray(groups)).toBe(true);
    expect(groups.length).toBeGreaterThan(0);
    // Al menos un grupo tiene standings con equipos
    const total = groups.reduce(
      (acc: number, g: any) => acc + (g.standings?.length ?? 0),
      0
    );
    expect(total).toBeGreaterThan(0);
  });

  it("responde a stats y bracket sin errores", async () => {
    const stats = await request(app).get(`/api/tournaments/${tournamentId}/stats`).set(auth);
    expect(stats.status).toBe(200);

    const bracket = await request(app)
      .get(`/api/tournaments/${tournamentId}/bracket`)
      .set(auth);
    expect(bracket.status).toBe(200);
  });
});

describe("Partidos", () => {
  it("lista partidos del torneo creado en modo AUTOMATICO", async () => {
    const res = await request(app)
      .get(`/api/matches?tournamentId=${tournamentId}`)
      .set(auth);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    if (res.body.data.length > 0) createdMatchId = res.body.data[0].id;
  });

  it("obtiene un partido por id", async () => {
    expect(createdMatchId).toBeTruthy();
    const res = await request(app).get(`/api/matches/${createdMatchId}`).set(auth);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(createdMatchId);
  });
});

describe("Admin (users)", () => {
  it("lista usuarios con token de administrador", async () => {
    const res = await request(app).get("/api/admin/users").set(auth);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
