import { NextResponse } from "next/server";
import { prisma } from "@flowbit/db";

export async function GET() {
  try {
    const rows = await prisma.invoice.groupBy({
      by: ["vendorId"],
      _sum: { total: true },
      orderBy: { _sum: { total: "desc" } },
      take: 10,
    });

    const vendorIds = rows.map((r) => r.vendorId);
    const vendors = await prisma.vendor.findMany({
      where: { id: { in: vendorIds } },
    });

    const nameById = new Map(vendors.map((v) => [v.id, v.name] as const));

    return NextResponse.json(
      rows.map((r) => ({
        vendor: nameById.get(r.vendorId) ?? "Unknown",
        spend: r._sum.total ? Number(r._sum.total) : 0,
      }))
    );
  } catch (error) {
    console.error("Error fetching top vendors:", error);
    return NextResponse.json({ error: "Failed to fetch top vendors" }, { status: 500 });
  }
}

