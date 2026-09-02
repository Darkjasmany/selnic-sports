import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// Mocks de las dependencias del componente
vi.mock("react-router-dom", () => ({
  useParams: () => ({ id: "t1" }),
}));
vi.mock("@/features/tournaments/api/tournaments.api", () => ({
  getTournamentById: vi.fn(),
}));
vi.mock("@/features/tournaments/hooks/useTournaments", async () => {
  const actual = await vi.importActual<
    typeof import("@/features/tournaments/hooks/useTournaments")
  >("@/features/tournaments/hooks/useTournaments");
  return {
    ...actual,
    useTournamentStandings: vi.fn(),
    useTournamentStats: vi.fn(),
    useTournamentBracket: vi.fn(),
  };
});

import { getTournamentById } from "@/features/tournaments/api/tournaments.api";
import {
  useTournamentBracket,
  useTournamentStandings,
  useTournamentStats,
} from "@/features/tournaments/hooks/useTournaments";
import TournamentDetailPage from "@/features/tournaments/pages/TournamentDetailPage";

const mockedGet = vi.mocked(getTournamentById);
const mockedStandings = vi.mocked(useTournamentStandings);
const mockedStats = vi.mocked(useTournamentStats);
const mockedBracket = vi.mocked(useTournamentBracket);

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function renderPage() {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      <TournamentDetailPage />
    </QueryClientProvider>
  );
}

const tournamentWithTeams = {
  id: "t1",
  name: "Copa Campeones 2026",
  discipline: { id: "d1", name: "Fútbol" },
  category: { id: "c1", name: "Sub15" },
  formatType: "GROUPS_AND_KNOCKOUT",
  groups: [
    {
      id: "g1",
      name: "Group A",
      teamGroups: [
        {
          id: "tg1",
          teamId: "team1",
          points: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          team: { id: "team1", name: "Real Madrid" },
        },
        {
          id: "tg2",
          teamId: "team2",
          points: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          team: { id: "team2", name: "Barcelona" },
        },
      ],
    },
  ],
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("TournamentDetailPage — Grupos y posiciones", () => {
  it("muestra los equipos asignados a un grupo aunque no existan standings calculados (regresión del bug)", async () => {
    // El bug: sin registros TeamGroup con partidos jugados, standings llega vacío
    // y la vista interna no mostraba los equipos. Con el fix, los equipos se
    // renderizan desde tournament.groups[].teamGroups.
    mockedGet.mockResolvedValue(tournamentWithTeams as any);
    mockedStandings.mockReturnValue({ data: undefined } as any);
    mockedStats.mockReturnValue({ data: undefined } as any);
    mockedBracket.mockReturnValue({ data: undefined } as any);

    renderPage();

    const title = await screen.findByText("Copa Campeones 2026");
    expect(title).toBeInTheDocument();

    // La pestaña "Grupos y posiciones" es la activa por defecto
    expect(screen.getByText("Group A")).toBeInTheDocument();
    expect(screen.getByText("Real Madrid")).toBeInTheDocument();
    expect(screen.getByText("Barcelona")).toBeInTheDocument();
  });

  it("usa los standings calculados (con puntos) cuando existen", async () => {
    mockedGet.mockResolvedValue(tournamentWithTeams as any);
    mockedStandings.mockReturnValue({
      data: [
        {
          group: { id: "g1", name: "Group A" },
          standings: [
            {
              teamId: "team1",
              teamName: "Real Madrid",
              points: 6,
              plays: 1,
              wins: 1,
              draws: 0,
              losses: 0,
              goalsFor: 3,
              goalsAgainst: 0,
              goalDifference: 3,
              position: 1,
            },
          ],
        },
      ],
    } as any);
    mockedStats.mockReturnValue({ data: undefined } as any);
    mockedBracket.mockReturnValue({ data: undefined } as any);

    renderPage();

    const points = await screen.findByText("6");
    expect(points).toBeInTheDocument();
    expect(screen.getByText("Real Madrid")).toBeInTheDocument();
  });
});
