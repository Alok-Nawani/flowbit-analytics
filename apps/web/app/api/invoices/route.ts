import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@flowbit/db";

export async function GET(req: NextRequest) {
  try {
    const p = new URL(req.url).searchParams;
    const q = p.get("q");
    const status = p.get("status");
    const take = Number(p.get("take") ?? 50);
    const page = Number(p.get("page") ?? 1);
    const skip = (page - 1) * take;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (q) {
      where.OR = [
        { invoiceNumber: { contains: q, mode: "insensitive" } },
        { vendor: { name: { contains: q, mode: "insensitive" } } },
        { customer: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    const [rows, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: { vendor: true, customer: true },
        orderBy: { invoiceDate: "desc" },
        skip,
        take,
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({
      total,
      page,
      pageSize: take,
      rows: rows.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        vendor: inv.vendor.name,
        customer: inv.customer?.name ?? null,
        invoiceDate: inv.invoiceDate.toISOString(),
        dueDate: inv.dueDate?.toISOString() ?? null,
        total: Number(inv.total),
        status: inv.status,
        currency: inv.currency,
      })),
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

