import { describe, expect, it } from "vitest";
import {
  createMatchSchema,
  saveIncidentsSchema,
  validatePlayerSchema,
} from "@/modules/matches/match.schema";
import { createPlayerSchema, saveBiometricSchema } from "@/modules/players/player.schema";
import { createTeamSchema } from "@/modules/teams/team.schema";
import { createTournamentSchema } from "@/modules/tournaments/tournament.schema";

// cuid válido (empieza con 'c' y ≥8 caracteres sin espacios/guiones)
const cuid = (suffix: string) => `c1234567890abcdefgh${suffix}`.slice(0, 25);

describe("createPlayerSchema", () => {
  const basePlayer = {
    firstName: "Juan",
    lastName: "Pérez",
    birthDate: "2010-05-15",
    documentId: "1712345678",
    teamId: cuid("team"),
    phone: "0999999999",
  };

  it("acepta un jugador válido", () => {
    const res = createPlayerSchema.safeParse(basePlayer);
    expect(res.success).toBe(true);
  });

  it("rechaza si falta el nombre", () => {
    const res = createPlayerSchema.safeParse({ ...basePlayer, firstName: undefined });
    expect(res.success).toBe(false);
  });

  it("rechaza una fecha de nacimiento inválida", () => {
    const res = createPlayerSchema.safeParse({ ...basePlayer, birthDate: "no-es-fecha" });
    expect(res.success).toBe(false);
  });

  it("rechaza un documento demasiado corto", () => {
    const res = createPlayerSchema.safeParse({ ...basePlayer, documentId: "123" });
    expect(res.success).toBe(false);
  });

  it("aplica valores por defecto (nationality, isActive)", () => {
    const res = createPlayerSchema.safeParse(basePlayer);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.nationality).toBe("Ecuatoriana");
      expect(res.data.isActive).toBe(true);
    }
  });
});

describe("createTeamSchema", () => {
  const baseTeam = {
    name: "Equipo Test",
    disciplineId: cuid("disc"),
    categoryId: cuid("cat"),
  };

  it("acepta un equipo válido", () => {
    expect(createTeamSchema.safeParse(baseTeam).success).toBe(true);
  });

  it("rechaza un nombre vacío o muy corto", () => {
    expect(createTeamSchema.safeParse({ ...baseTeam, name: "A" }).success).toBe(false);
  });

  it("rechaza IDs que no son cuid", () => {
    expect(createTeamSchema.safeParse({ ...baseTeam, disciplineId: "bad-id!" }).success).toBe(
      false
    );
  });
});

describe("createMatchSchema", () => {
  const baseMatch = {
    homeTeamId: cuid("home"),
    awayTeamId: cuid("away"),
    categoryId: cuid("cat"),
    scheduledAt: "2026-09-10T15:00:00.000Z",
  };

  it("acepta un partido válido", () => {
    expect(createMatchSchema.safeParse(baseMatch).success).toBe(true);
  });

  it("rechaza si local y visitante son el mismo equipo", () => {
    const res = createMatchSchema.safeParse({
      ...baseMatch,
      awayTeamId: baseMatch.homeTeamId,
    });
    expect(res.success).toBe(false);
  });

  it("rechaza una fecha inválida", () => {
    const res = createMatchSchema.safeParse({ ...baseMatch, scheduledAt: "fecha-mala" });
    expect(res.success).toBe(false);
  });
});

describe("validatePlayerSchema", () => {
  it("acepta una validación válida con descriptor biométrico", () => {
    const res = validatePlayerSchema.safeParse({
      playerId: cuid("p"),
      teamSide: "HOME",
      biometricDescriptor: [0.1, 0.2, 0.3],
    });
    expect(res.success).toBe(true);
  });

  it("rechaza un teamSide inválido", () => {
    const res = validatePlayerSchema.safeParse({
      playerId: cuid("p"),
      teamSide: "CENTER",
      biometricDescriptor: [],
    });
    expect(res.success).toBe(false);
  });
});

describe("saveBiometricSchema", () => {
  it("acepta datos biométricos con tipo por defecto FACIAL", () => {
    const res = saveBiometricSchema.safeParse({ biometricData: [1, 2, 3] });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.biometricType).toBe("FACIAL");
  });

  it("rechaza datos que no son array de números", () => {
    const res = saveBiometricSchema.safeParse({ biometricData: "no" });
    expect(res.success).toBe(false);
  });
});

describe("createTournamentSchema", () => {
  const baseTournament = {
    name: "Torneo Test",
    disciplineId: cuid("disc"),
    categoryId: cuid("cat"),
    formatType: "GROUPS_AND_KNOCKOUT",
    generationMode: "AUTOMATIC",
  };

  it("acepta un torneo válido y aplica defaults", () => {
    const res = createTournamentSchema.safeParse(baseTournament);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.qualifiedPerGroup).toBe(2);
      expect(res.data.maxGroups).toBe(4);
    }
  });

  it("rechaza un formatType inválido", () => {
    const res = createTournamentSchema.safeParse({
      ...baseTournament,
      formatType: "BOGUS",
    });
    expect(res.success).toBe(false);
  });

  it("rechaza un nombre muy corto", () => {
    const res = createTournamentSchema.safeParse({ ...baseTournament, name: "X" });
    expect(res.success).toBe(false);
  });
});

describe("saveIncidentsSchema", () => {
  it("acepta marcador con incidentes vacíos", () => {
    const res = saveIncidentsSchema.safeParse({ homeScore: 0, awayScore: 0, incidents: [] });
    expect(res.success).toBe(true);
  });

  it("acepta un gol con su jugador y minuto", () => {
    const res = saveIncidentsSchema.safeParse({
      homeScore: 1,
      awayScore: 0,
      incidents: [{ playerId: cuid("p"), teamSide: "HOME", type: "GOAL", minute: 10 }],
    });
    expect(res.success).toBe(true);
  });

  it("rechaza un tipo de incidente inválido", () => {
    const res = saveIncidentsSchema.safeParse({
      homeScore: 0,
      awayScore: 0,
      incidents: [{ type: "NOT_A_TYPE" }],
    });
    expect(res.success).toBe(false);
  });

  it("rechaza un marcador negativo", () => {
    const res = saveIncidentsSchema.safeParse({ homeScore: -1, awayScore: 0, incidents: [] });
    expect(res.success).toBe(false);
  });
});
