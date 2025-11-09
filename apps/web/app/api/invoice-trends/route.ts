import { NextResponse } from "next/server";
import { prisma } from "@flowbit/db";

export async function GET() {
  try {
    const rows = await prisma.$queryRawUnsafe<Array<{
      month: string;
      invoice_count: bigint;
      total_spend: number;
    }>>(`
      SELECT to_char(date_trunc('month', "invoiceDate"), 'YYYY-MM') as month,
             COUNT(*)::int as invoice_count,
             SUM(total)::numeric as total_spend
      FROM "Invoice"
      GROUP BY 1
      ORDER BY 1;
    `);
    
    return NextResponse.json(
      rows.map((r) => ({
        month: r.month,
        invoice_count: Number(r.invoice_count),
        total_spend: Number(r.total_spend),
      }))
    );
  } catch (error) {
    console.error("Error fetching invoice trends:", error);
    return NextResponse.json({ error: "Failed to fetch invoice trends" }, { status: 500 });
  }
}

