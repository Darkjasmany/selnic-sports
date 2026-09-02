import { describe, expect, it } from "vitest";
import {
  generateRoundRobin,
  knockoutPhases,
  nextPhase,
} from "@/modules/tournaments/calendar.service";

describe("generateRoundRobin (Algoritmo de Berger)", () => {
  it("genera N-1 rondas y N/2 partidos por ronda para un número par de equipos", () => {
    const teams = ["A", "B", "C", "D"];
    const rounds = generateRoundRobin(teams);

    expect(rounds).toHaveLength(3); // N - 1 = 3
    for (const round of rounds) {
      expect(round).toHaveLength(2); // N/2 = 2 partidos por ronda
    }
    // Total de partidos = N*(N-1)/2 = 6
    expect(rounds.flat()).toHaveLength(6);
  });

  it("cada equipo juega exactamente una vez cada otra vez (round robin completo)", () => {
    const teams = ["A", "B", "C", "D"];
    const rounds = generateRoundRobin(teams);
    const matches = rounds.flat();

    const appearances = new Map<string, number>();
    for (const [home, away] of matches) {
      appearances.set(home, (appearances.get(home) ?? 0) + 1);
      appearances.set(away, (appearances.get(away) ?? 0) + 1);
    }

    expect(appearances.size).toBe(4);
    for (const count of appearances.values()) {
      expect(count).toBe(3); // cada equipo juega contra los otros 3
    }
  });

  it("nunca se empareja un equipo consigo mismo", () => {
    const rounds = generateRoundRobin(["A", "B", "C", "D", "E"]);
    for (const [home, away] of rounds.flat()) {
      expect(home).not.toBe(away);
    }
  });

  it("con un número impar de equipos agrega un BYE y usa el total de equipos pares", () => {
    const rounds = generateRoundRobin(["A", "B", "C", "D", "E"]);
    // N=5 → con BYE son 6 equipos → 5 rondas, 3 "partidos" por ronda (algunos son BYE)
    expect(rounds).toHaveLength(5);
    for (const round of rounds) {
      expect(round.length).toBeLessThanOrEqual(3);
    }
  });

  it("no genera partidos si hay menos de 2 equipos", () => {
    expect(generateRoundRobin([])).toEqual([]);
    expect(generateRoundRobin(["A"]).flat()).toEqual([]);
  });
});

describe("nextPhase", () => {
  it("avanza correctamente entre fases de eliminación directa", () => {
    expect(nextPhase("ROUND_OF_16")).toBe("QUARTER_FINAL");
    expect(nextPhase("QUARTER_FINAL")).toBe("SEMI_FINAL");
    expect(nextPhase("SEMI_FINAL")).toBe("FINAL");
    expect(nextPhase("FINAL")).toBe("FINAL");
  });
});

describe("knockoutPhases", () => {
  it("con 16 clasificados incluye octavos, cuartos, semis, tercer puesto y final", () => {
    const phases = knockoutPhases(16);
    expect(phases).toEqual([
      "ROUND_OF_16",
      "QUARTER_FINAL",
      "SEMI_FINAL",
      "THIRD_PLACE",
      "FINAL",
    ]);
  });

  it("con 8 clasificados no incluye octavos", () => {
    const phases = knockoutPhases(8);
    expect(phases).toContain("QUARTER_FINAL");
    expect(phases).not.toContain("ROUND_OF_16");
  });

  it("siempre termina con tercer puesto y final cuando hay 4+", () => {
    const phases = knockoutPhases(4);
    expect(phases[phases.length - 2]).toBe("THIRD_PLACE");
    expect(phases[phases.length - 1]).toBe("FINAL");
  });
});
