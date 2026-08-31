import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();

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
    {
      name: "Fútbol",
      playersPerField: 11,
      maxSubstitutions: 5,
      allowsDraw: true,
    },
    {
      name: "Básquetbol",
      playersPerField: 5,
      maxSubstitutions: 5,
      allowsDraw: false,
    },
    {
      name: "Ajedrez",
      playersPerField: 1,
      maxSubstitutions: 0,
      allowsDraw: true,
    },
  ];

  for (const disc of disciplinasData) {
    const disciplina = await prisma.discipline.upsert({
      where: { name: disc.name },
      update: {},
      create: disc,
    });
    console.log("✅ Disciplina creada:", disciplina.name);

    // ==========================================
    // CATEGORIES PER DISCIPLINE
    // ==========================================
    let categoriasNames: string[] = [];
    let teamsData: { name: string; category: string; coach?: string }[] = [];

    if (disc.name === "Fútbol") {
      categoriasNames = ["Sub12", "Sub15", "Sub18", "Mayores"];
      teamsData = [
        { name: "Real Madrid", category: "Sub15", coach: "Carlos Pérez" },
        { name: "Barcelona", category: "Sub15", coach: "Luis Gómez" },
        { name: "Real Madrid", category: "Sub18", coach: "Carlos Pérez" },
        { name: "Barcelona", category: "Sub18", coach: "Luis Gómez" },
        { name: "Real Madrid", category: "Mayores", coach: "Carlos Pérez" },
        { name: "Barcelona", category: "Mayores", coach: "Luis Gómez" },
        { name: "Liga de Quito", category: "Mayores", coach: "Juan Martínez" },
        { name: "Emelec", category: "Mayores", coach: "Pedro Sánchez" },
      ];
    } else if (disc.name === "Básquetbol") {
      categoriasNames = ["Sub14", "Sub17", "Sub21", "Mayores"];
      teamsData = [
        { name: "Lakers", category: "Sub17", coach: "Ana Torres" },
        { name: "Celtics", category: "Sub17", coach: "Roberto Díaz" },
        { name: "Lakers", category: "Mayores", coach: "Ana Torres" },
        { name: "Celtics", category: "Mayores", coach: "Roberto Díaz" },
      ];
    } else if (disc.name === "Ajedrez") {
      categoriasNames = ["Sub12", "Sub16", "Absoluta"];
      teamsData = [
        { name: "Alfil", category: "Sub16", coach: "María López" },
        { name: "Torre", category: "Sub16", coach: "Diego Vargas" },
        { name: "Alfil", category: "Absoluta", coach: "María López" },
        { name: "Torre", category: "Absoluta", coach: "Diego Vargas" },
      ];
    }

    for (const catName of categoriasNames) {
      const category = await prisma.category.upsert({
        where: { disciplineId_name: { disciplineId: disciplina.id, name: catName } },
        update: {},
        create: {
          disciplineId: disciplina.id,
          name: catName,
        },
      });
      console.log(`  ✅ Categoría: ${catName} (${disc.name})`);
    }

    // ==========================================
    // TEAMS PER DISCIPLINE
    // ==========================================
    for (const team of teamsData) {
      const category = await prisma.category.findUnique({
        where: { disciplineId_name: { disciplineId: disciplina.id, name: team.category } },
      });
      if (category) {
        await prisma.team.upsert({
          where: {
            disciplineId_categoryId_name: {
              disciplineId: disciplina.id,
              categoryId: category.id,
              name: team.name,
            },
          },
          update: {},
          create: {
            name: team.name,
            disciplineId: disciplina.id,
            categoryId: category.id,
            coachName: team.coach,
          },
        });
        console.log(`    ⚽ Equipo: ${team.name} (${team.category})`);
      }
    }
  }

  console.log("\n🎉 Seed completado exitosamente!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
