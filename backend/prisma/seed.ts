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

    if (disc.name === "Fútbol") {
      categoriasNames = ["Sub12", "Sub15", "Sub18", "Mayores"];
    } else if (disc.name === "Básquetbol") {
      categoriasNames = ["Sub14", "Sub17", "Sub21", "Mayores"];
    } else if (disc.name === "Ajedrez") {
      categoriasNames = ["Sub12", "Sub16", "Absoluta"];
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
  }

  console.log("\n🎉 Seed completado exitosamente!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
