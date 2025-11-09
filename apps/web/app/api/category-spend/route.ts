import { NextResponse } from "next/server";
import { prisma } from "@flowbit/db";

export async function GET() {
  try {
    const rows = await prisma.invoice.groupBy({
      by: ["categoryId"],
      _sum: { total: true },
    });

    const categoryIds = rows.map((r) => r.categoryId).filter((id): id is string => id !== null);
    const cats = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    const nameById = new Map(cats.map((c) => [c.id, c.name] as const));

    return NextResponse.json(
      rows.map((r) => ({
        category: r.categoryId ? (nameById.get(r.categoryId) ?? "Uncategorized") : "Uncategorized",
        spend: r._sum.total ? Number(r._sum.total) : 0,
      }))
    );
  } catch (error) {
    console.error("Error fetching category spend:", error);
    return NextResponse.json({ error: "Failed to fetch category spend" }, { status: 500 });
  }
}

