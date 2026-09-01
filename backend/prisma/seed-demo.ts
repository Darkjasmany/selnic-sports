import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();

// ==========================================
// NAMES DATA
// ==========================================
const nombres = [
  "Carlos", "Miguel", "José", "Luis", "Diego", "Andrés", "Juan", "Pedro",
  "Gabriel", "Sebastián", "Francisco", "Roberto", "Martín", "Ricardo", "Fernando",
  "Alejandro", "Santiago", "Daniel", "Emilio", "Rafael", "Antonio", "Jorge",
  "Marco", "Leonardo", "Óscar", "Eduardo", "Patricio", "Víctor", "Rolando",
  "Edison", "Kevin", "Steven", "Brandon", "Alex", "Brian", "Joel",
  "Ana", "María", "Laura", "Cristina", "Gabriela", "Patricia", "Sandra",
  "Verónica", "Andrea", "Carolina", "Daniela", "Fernanda", "Gloria", "Rosa",
];

const apellidos = [
  "García", "López", "Martínez", "Rodríguez", "Pérez", "Sánchez", "Ramírez",
  "Torres", "Flores", "Rivera", "Gómez", "Díaz", "Cruz", "Morales", "Ortiz",
  "Gutiérrez", "Chávez", "Vargas", "Castillo", "Romero", "Mendoza", "Reyes",
  "Herrera", "Salazar", "Paredes", "Escobar", "Cárdenas", "Naranjo", "Guerrero",
  "Suárez", "Montoya", "Barrera", "Cornejo", "Figueroa", "Arroyo", "Delgado",
  "Cedeño", "Cevallos", "Plúa", "Caicedo", "Yépez", "Tapia", "Intriago",
  "Bustamante", "Ponce", "Lara", "Medina", "Acosta", "Bravo", "Auquilla",
];

function generarNombre(index: number): { firstName: string; lastName: string } {
  const firstName = nombres[index % nombres.length];
  const lastName1 = apellidos[Math.floor(index / nombres.length) % apellidos.length];
  const lastName2 = apellidos[(index * 3 + 7) % apellidos.length];
  return { firstName, lastName: `${lastName1} ${lastName2}` };
}

function generarCedula(base: number): string {
  return String(base).padStart(10, "0");
}

function fechaNacimiento(anosAtras: number): Date {
  const fecha = new Date();
  fecha.setFullYear(fecha.getFullYear() - anosAtras);
  fecha.setMonth(Math.floor(Math.random() * 12));
  fecha.setDate(Math.floor(Math.random() * 28) + 1);
  return fecha;
}

// ==========================================
// MAIN
// ==========================================
async function main() {
  // ==========================================
  // ADMIN USER
  // ==========================================
  const hashedPassword = await bcrypt.hash("Admin1234!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@selnicsports.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@selnicsports.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin creado:", admin.email);

  // ==========================================
  // DISCIPLINES
  // ==========================================
  const disciplinasData = [
    { name: "Fútbol", playersPerField: 11, maxSubstitutions: 5, allowsDraw: true },
    { name: "Básquetbol", playersPerField: 5, maxSubstitutions: 5, allowsDraw: false },
    { name: "Ajedrez", playersPerField: 1, maxSubstitutions: 0, allowsDraw: true },
  ];

  for (const disc of disciplinasData) {
    const disciplina = await prisma.discipline.upsert({
      where: { name: disc.name },
      update: {},
      create: disc,
    });
    console.log("✅ Disciplina creada:", disciplina.name);
  }

  // ==========================================
  // CATEGORIES
  // ==========================================
  const futbol = await prisma.discipline.findUnique({ where: { name: "Fútbol" } });
  const basquetbol = await prisma.discipline.findUnique({ where: { name: "Básquetbol" } });
  const ajedrez = await prisma.discipline.findUnique({ where: { name: "Ajedrez" } });

  const futbolCats = ["Sub12", "Sub15", "Sub18", "Mayores"];
  const basquetCats = ["Sub14", "Sub17", "Sub21", "Mayores"];
  const ajedrezCats = ["Sub12", "Sub16", "Absoluta"];

  for (const catName of futbolCats) {
    await prisma.category.upsert({
      where: { disciplineId_name: { disciplineId: futbol!.id, name: catName } },
      update: {},
      create: { disciplineId: futbol!.id, name: catName },
    });
  }
  for (const catName of basquetCats) {
    await prisma.category.upsert({
      where: { disciplineId_name: { disciplineId: basquetbol!.id, name: catName } },
      update: {},
      create: { disciplineId: basquetbol!.id, name: catName },
    });
  }
  for (const catName of ajedrezCats) {
    await prisma.category.upsert({
      where: { disciplineId_name: { disciplineId: ajedrez!.id, name: catName } },
      update: {},
      create: { disciplineId: ajedrez!.id, name: catName },
    });
  }
  console.log("✅ Categorías creadas");

  // ==========================================
  // TEAMS
  // ==========================================

  // --- Fútbol Mayores: 4 equipos ---
  const futbolMayores = await prisma.category.findUnique({
    where: { disciplineId_name: { disciplineId: futbol!.id, name: "Mayores" } },
  });
  const futbolTeams = [
    { name: "Real Madrid", coach: "Carlos Pérez" },
    { name: "Barcelona", coach: "Luis Gómez" },
    { name: "Liga de Quito", coach: "Juan Martínez" },
    { name: "Emelec", coach: "Pedro Sánchez" },
  ];
  for (const t of futbolTeams) {
    await prisma.team.upsert({
      where: {
        disciplineId_categoryId_name: {
          disciplineId: futbol!.id,
          categoryId: futbolMayores!.id,
          name: t.name,
        },
      },
      update: {},
      create: {
        name: t.name,
        disciplineId: futbol!.id,
        categoryId: futbolMayores!.id,
        coachName: t.coach,
      },
    });
  }
  console.log("  ⚽ Equipos de fútbol creados: Real Madrid, Barcelona, Liga de Quito, Emelec");

  // --- Básquetbol Mayores: 2 equipos ---
  const basquetMayores = await prisma.category.findUnique({
    where: { disciplineId_name: { disciplineId: basquetbol!.id, name: "Mayores" } },
  });
  const basquetTeams = [
    { name: "Lakers", coach: "Ana Torres" },
    { name: "Celtics", coach: "Roberto Díaz" },
  ];
  for (const t of basquetTeams) {
    await prisma.team.upsert({
      where: {
        disciplineId_categoryId_name: {
          disciplineId: basquetbol!.id,
          categoryId: basquetMayores!.id,
          name: t.name,
        },
      },
      update: {},
      create: {
        name: t.name,
        disciplineId: basquetbol!.id,
        categoryId: basquetMayores!.id,
        coachName: t.coach,
      },
    });
  }
  console.log("  🏀 Equipos de básquetbol creados: Lakers, Celtics");

  // --- Ajedrez: 5 clubes por categoría ---
  const clubNames = ["Club Alfil", "Club Torre", "Club Dama", "Club Caballo", "Club Rey"];
  const clubCoaches: Record<string, string> = {
    "Club Alfil": "María López",
    "Club Torre": "Diego Vargas",
    "Club Dama": "Rosa Cevallos",
    "Club Caballo": "Fernando Reyes",
    "Club Rey": "Patricia Muñoz",
  };

  for (const catName of ajedrezCats) {
    const cat = await prisma.category.findUnique({
      where: { disciplineId_name: { disciplineId: ajedrez!.id, name: catName } },
    });
    for (const club of clubNames) {
      await prisma.team.upsert({
        where: {
          disciplineId_categoryId_name: {
            disciplineId: ajedrez!.id,
            categoryId: cat!.id,
            name: club,
          },
        },
        update: {},
        create: {
          name: club,
          disciplineId: ajedrez!.id,
          categoryId: cat!.id,
          coachName: clubCoaches[club],
        },
      });
    }
  }
  console.log("  ♟️  Clubes de ajedrez creados: Alfil, Torre, Dama, Caballo, Rey (×3 categorías)");

  // ==========================================
  // PLAYERS - DATA
  // ==========================================
  let cedulaBase = 1700000001;
  let nombreIdx = 0;

  // Helper: create a player
  async function crearJugador(
    overrides: Partial<{
      firstName: string;
      lastName: string;
      birthDate: Date;
      documentId: string;
      phone: string;
      address: string;
      bloodType: string;
      nationality: string;
      disciplineId: string;
      guardianName: string;
      guardianPhone: string;
      educationalUnit: string;
      educationalLevel: string;
      educationalAddress: string;
    }> = {}
  ) {
    const base = generarNombre(nombreIdx++);
    const docId = generarCedula(cedulaBase++);
    const jugador = await prisma.player.create({
      data: {
        firstName: overrides.firstName ?? base.firstName,
        lastName: overrides.lastName ?? base.lastName,
        birthDate: overrides.birthDate ?? fechaNacimiento(25),
        documentId: overrides.documentId ?? docId,
        phone: overrides.phone ?? `09${String(Math.floor(Math.random() * 90000000) + 10000000)}`,
        address: overrides.address ?? "Av. Principal, Guayaquil",
        bloodType: overrides.bloodType ?? ["A+", "A-", "B+", "B-", "O+", "O-"][Math.floor(Math.random() * 6)],
        nationality: overrides.nationality ?? "Ecuatoriana",
        disciplineId: overrides.disciplineId ?? futbol!.id,
        guardianName: overrides.guardianName ?? null,
        guardianPhone: overrides.guardianPhone ?? null,
        educationalUnit: overrides.educationalUnit ?? null,
        educationalLevel: overrides.educationalLevel ?? null,
        educationalAddress: overrides.educationalAddress ?? null,
      },
    });
    return jugador;
  }

  // Helper: assign player to team
  async function asignarAEquipo(playerId: string, teamId: string) {
    await prisma.teamPlayer.upsert({
      where: { teamId_playerId: { teamId, playerId } },
      update: {},
      create: { teamId, playerId },
    });
  }

  // ==========================================
  // FÚTBOL - 4 equipos × 18 jugadores = 72
  // ==========================================
  console.log("\n⚽ Creando jugadores de fútbol...");

  const futbolTeamRecords = await prisma.team.findMany({
    where: { disciplineId: futbol!.id, categoryId: futbolMayores!.id },
  });

  // Posiciones de fútbol
  const futbolPosiciones = [
    "Portero", "Defensa Central", "Defensa Central", "Lateral Derecho", "Lateral Izquierdo",
    "Mediocampista Defensivo", "Mediocampista Centro", "Mediocampista Ofensivo",
    "Delantero Centro", "Extremo Derecho", "Extremo Izquierdo",
    // Suplentes
    "Portero Suplente", "Defensa Suplente", "Defensa Suplente",
    "Mediocampista Suplente", "Mediocampista Suplente",
    "Delantero Suplente", "Delantero Suplente",
  ];

  for (const team of futbolTeamRecords) {
    console.log(`  📋 ${team.name}:`);
    for (let i = 0; i < 18; i++) {
      const { firstName, lastName } = generarNombre(nombreIdx);
      const jugador = await crearJugador({
        firstName,
        lastName,
        birthDate: fechaNacimiento(22 + Math.floor(Math.random() * 8)),
        documentId: generarCedula(cedulaBase++),
        disciplineId: futbol!.id,
      });
      await asignarAEquipo(jugador.id, team.id);
      console.log(`    ✅ ${firstName} ${lastName} — ${futbolPosiciones[i]}`);
    }
  }

  // ==========================================
  // BASKETBOL - 2 equipos × 12 jugadores = 24
  // ==========================================
  console.log("\n🏀 Creando jugadores de básquetbol...");

  const basquetTeamRecords = await prisma.team.findMany({
    where: { disciplineId: basquetbol!.id, categoryId: basquetMayores!.id },
  });

  const basquetPosiciones = [
    "Base", "Escolta", "Alero", "Ala-Pívot", "Pívot",
    // Suplentes
    "Base Suplente", "Escolta Suplente", "Alero Suplente",
    "Ala-Pívot Suplente", "Pívot Suplente",
    "Ala-Pívot Suplente", "Pívot Suplente",
  ];

  for (const team of basquetTeamRecords) {
    console.log(`  📋 ${team.name}:`);
    for (let i = 0; i < 12; i++) {
      const { firstName, lastName } = generarNombre(nombreIdx);
      const jugador = await crearJugador({
        firstName,
        lastName,
        birthDate: fechaNacimiento(20 + Math.floor(Math.random() * 10)),
        documentId: generarCedula(cedulaBase++),
        disciplineId: basquetbol!.id,
      });
      await asignarAEquipo(jugador.id, team.id);
      console.log(`    ✅ ${firstName} ${lastName} — ${basquetPosiciones[i]}`);
    }
  }

  // ==========================================
  // AJEDREZ - 15 equipos × 4 jugadores = 60
  // ==========================================
  console.log("\n♟️  Creando jugadores de ajedrez...");

  const ajedrezTeamRecords = await prisma.team.findMany({
    where: { disciplineId: ajedrez!.id },
  });

  const ajedrezPosiciones = ["Tablero 1", "Tablero 2", "Tablero 3", "Tablero 4"];

  // Edades según categoría
  const ajedrezEdades: Record<string, [number, number]> = {
    Sub12: [10, 12],
    Sub16: [13, 16],
    Absoluta: [18, 35],
  };

  for (const team of ajedrezTeamRecords) {
    const cat = await prisma.category.findUnique({ where: { id: team.categoryId } });
    const [minEdad, maxEdad] = ajedrezEdades[cat?.name ?? "Absoluta"] ?? [18, 35];
    console.log(`  📋 ${team.name} (${cat?.name}):`);
    for (let i = 0; i < 4; i++) {
      const { firstName, lastName } = generarNombre(nombreIdx);
      const edad = minEdad + Math.floor(Math.random() * (maxEdad - minEdad + 1));
      const jugador = await crearJugador({
        firstName,
        lastName,
        birthDate: fechaNacimiento(edad),
        documentId: generarCedula(cedulaBase++),
        disciplineId: ajedrez!.id,
      });
      await asignarAEquipo(jugador.id, team.id);
      console.log(`    ✅ ${firstName} ${lastName} — ${ajedrezPosiciones[i]}`);
    }
  }

  // ==========================================
  // SUMMARY
  // ==========================================
  const totalPlayers = await prisma.player.count();
  const totalTeamPlayers = await prisma.teamPlayer.count();

  console.log("\n========================================");
  console.log("🎉 Seed demo completado exitosamente!");
  console.log("========================================");
  console.log(`  👤 Admin: admin@selnicsports.com`);
  console.log(`  ⚽ Jugadores de fútbol: ${futbolTeamRecords.length * 18}`);
  console.log(`  🏀 Jugadores de básquetbol: ${basquetTeamRecords.length * 12}`);
  console.log(`  ♟️  Jugadores de ajedrez: ${ajedrezTeamRecords.length * 4}`);
  console.log(`  📊 Total jugadores: ${totalPlayers}`);
  console.log(`  🔗 Asignaciones equipo-jugador: ${totalTeamPlayers}`);
  console.log("========================================");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
