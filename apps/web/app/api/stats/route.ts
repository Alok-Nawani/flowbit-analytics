import { NextResponse } from "next/server";
import { prisma } from "@flowbit/db";

export async function GET() {
  try {
    const [totals, docs] = await Promise.all([
      prisma.invoice.aggregate({
        _sum: { total: true },
        _avg: { total: true },
        _count: { _all: true },
      }),
      prisma.document.count(),
    ]);

    const paid = await prisma.payment.aggregate({ _sum: { amount: true } });
    const totalSpendYTD = await ytdSpend();

    return NextResponse.json({
      totalSpendYTD: Number(totalSpendYTD),
      totalInvoices: totals._count._all,
      documentsUploaded: docs,
      avgInvoiceValue: totals._avg.total ? Number(totals._avg.total) : 0,
      totalPaid: paid._sum.amount ? Number(paid._sum.amount) : 0,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}

async function ytdSpend() {
  const start = new Date(new Date().getFullYear(), 0, 1);
  const r = await prisma.invoice.aggregate({
    _sum: { total: true },
    where: { invoiceDate: { gte: start } },
  });
  return r._sum.total ?? 0;
}

