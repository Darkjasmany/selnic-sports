import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function cleanup() {
  // Find stale teams
  const teams = await prisma.team.findMany({ where: { name: { startsWith: "it-" } } });
  console.log("Stale teams:", teams.length);
  for (const t of teams) {
    // Delete TeamPlayer rows first
    await prisma.teamPlayer.deleteMany({ where: { teamId: t.id } });
    await prisma.team.delete({ where: { id: t.id } });
    console.log("  Deleted team:", t.name);
  }

  // Find stale categories
  const cats = await prisma.category.findMany({ where: { name: { contains: " it-" } } });
  console.log("Stale categories:", cats.length);
  for (const c of cats) {
    await prisma.category.delete({ where: { id: c.id } });
    console.log("  Deleted category:", c.name);
  }

  // Find stale disciplines
  const discs = await prisma.discipline.findMany({ where: { name: { startsWith: "Disciplina it-" } } });
  console.log("Stale disciplines:", discs.length);
  for (const d of discs) {
    await prisma.discipline.delete({ where: { id: d.id } });
    console.log("  Deleted discipline:", d.name);
  }

  await prisma.$disconnect();
}

cleanup().catch((e) => {
  console.error(e);
  process.exit(1);
});
