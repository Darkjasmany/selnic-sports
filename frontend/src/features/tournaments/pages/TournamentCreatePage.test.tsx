import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mocks de navegación y hooks
const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock("@/features/disciplines/hooks/useDisciplines", () => ({
  useDisciplines: vi.fn(),
}));
vi.mock("@/features/categories/hooks/useCategories", () => ({
  useCategories: vi.fn(),
}));
vi.mock("@/features/teams/hooks/useTeams", () => ({
  useTeams: vi.fn(),
}));
vi.mock("@/features/tournaments/hooks/useTournaments", () => ({
  useCreateTournament: vi.fn(),
}));

import { useCategories } from "@/features/categories/hooks/useCategories";
import { useDisciplines } from "@/features/disciplines/hooks/useDisciplines";
import { useTeams } from "@/features/teams/hooks/useTeams";
import { useCreateTournament } from "@/features/tournaments/hooks/useTournaments";
import TournamentCreatePage from "@/features/tournaments/pages/TournamentCreatePage";

const mockedDisciplines = vi.mocked(useDisciplines);
const mockedCategories = vi.mocked(useCategories);
const mockedTeams = vi.mocked(useTeams);
const mockedCreate = vi.mocked(useCreateTournament);

const mutateMock = vi.fn();

beforeEach(() => {
  mockedDisciplines.mockReturnValue({
    data: [{ id: "d1", name: "Fútbol" }],
  } as any);
  mockedCategories.mockReturnValue({
    data: [{ id: "c1", name: "Sub15" }],
  } as any);
  mockedTeams.mockReturnValue({
    data: [
      { id: "team1", name: "Real Madrid" },
      { id: "team2", name: "Barcelona" },
    ],
  } as any);
  mockedCreate.mockReturnValue({ mutate: mutateMock, isPending: false } as any);
  navigateMock.mockClear();
  mutateMock.mockClear();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderPage() {
  return render(
    <MemoryRouter>
      <TournamentCreatePage />
    </MemoryRouter>
  );
}

// Orden de los <select> en el form: 0 Disciplina, 1 Categoría, 2 Formato, 3 Modo
function selects() {
  return screen.getAllByRole("combobox");
}

describe("TournamentCreatePage", () => {
  it("renderiza el formulario y las disciplinas cargadas", () => {
    renderPage();

    expect(screen.getByText("Crear Torneo")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Fútbol" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Crear torneo" })).toBeInTheDocument();
  });

  it("selecciona disciplina/categoría y muestra los equipos disponibles", async () => {
    renderPage();
    const user = userEvent.setup();

    await user.selectOptions(selects()[0], "d1");
    await user.selectOptions(selects()[1], "c1");

    // Los equipos aparecen solo en modo AUTOMATIC (por defecto)
    expect(await screen.findByText("Real Madrid")).toBeInTheDocument();
    expect(screen.getByText("Barcelona")).toBeInTheDocument();
  });

  it("envía los teamIds seleccionados al crear en modo AUTOMATIC", async () => {
    renderPage();
    const user = userEvent.setup();

    await user.selectOptions(selects()[0], "d1");
    await user.selectOptions(selects()[1], "c1");

    await user.type(screen.getByPlaceholderText("Ej: Copa Campeones 2026"), "Copa Test");
    await user.click(await screen.findByText("Real Madrid"));

    await user.click(screen.getByRole("button", { name: "Crear torneo" }));

    expect(mutateMock).toHaveBeenCalledTimes(1);
    const payload = mutateMock.mock.calls[0][0];
    expect(payload.name).toBe("Copa Test");
    expect(payload.disciplineId).toBe("d1");
    expect(payload.categoryId).toBe("c1");
    expect(payload.generationMode).toBe("AUTOMATIC");
    expect(payload.teamIds).toEqual(["team1"]);
  });

  it("no envía teamIds en modo MANUAL", async () => {
    renderPage();
    const user = userEvent.setup();

    await user.selectOptions(selects()[0], "d1");
    await user.selectOptions(selects()[1], "c1");
    await user.selectOptions(selects()[3], "MANUAL");

    await user.type(screen.getByPlaceholderText("Ej: Copa Campeones 2026"), "Copa Manual");
    await user.click(screen.getByRole("button", { name: "Crear torneo" }));

    const payload = mutateMock.mock.calls[0][0];
    expect(payload.generationMode).toBe("MANUAL");
    expect(payload.teamIds).toBeUndefined();
  });
});
