import { prisma } from "@/config/database";

export class TeamService {
  static async findAll(categoryId?: string) {
    return prisma.team.findMany({
      where: categoryId ? { categoryId } : undefined,
      orderBy: { name: "asc" },
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { players: true } },
      },
    });
  }
}
