import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("Admin1234!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@futbol.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@futbol.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin creado:", admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
