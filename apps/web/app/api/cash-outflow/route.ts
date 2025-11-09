import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@flowbit/db";

export async function GET(req: NextRequest) {
  try {
    const search = new URL(req.url).searchParams;
    const start = search.get("start");
    const end = search.get("end");

    const where: any = {
      status: { in: ["PENDING", "APPROVED", "OVERDUE", "PARTIALLY_PAID"] },
    };

    if (start || end) {
      where.dueDate = {};
      if (start) where.dueDate.gte = new Date(start);
      if (end) where.dueDate.lte = new Date(end);
    }

    const rows = await prisma.invoice.groupBy({
      by: ["dueDate"],
      _sum: { total: true },
      where,
    });

    return NextResponse.json(
      rows
        .filter((r) => r.dueDate !== null)
        .map((r) => ({
          date: r.dueDate!.toISOString().split("T")[0],
          amount: r._sum.total ? Number(r._sum.total) : 0,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
    );
  } catch (error) {
    console.error("Error fetching cash outflow:", error);
    return NextResponse.json({ error: "Failed to fetch cash outflow" }, { status: 500 });
  }
}

