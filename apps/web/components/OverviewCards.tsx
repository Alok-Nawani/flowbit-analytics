"use client";

import useSWR from "swr";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { formatCurrency } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function OverviewCards() {
  const { data, isLoading } = useSWR("/api/stats", fetcher);

  const cards = [
    { label: "Total Spend (YTD)", value: data?.totalSpendYTD },
    { label: "Total Invoices", value: data?.totalInvoices },
    { label: "Documents Uploaded", value: data?.documentsUploaded },
    { label: "Average Invoice Value", value: data?.avgInvoiceValue },
  ];

  const cardGradients = [
    "from-blue-500/10 to-cyan-500/5",
    "from-purple-500/10 to-pink-500/5",
    "from-green-500/10 to-emerald-500/5",
    "from-orange-500/10 to-amber-500/5",
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((c, index) => (
        <Card 
          key={c.label} 
          className={`
            rounded-xl border border-border/50 
            bg-gradient-to-br ${cardGradients[index % cardGradients.length]}
            backdrop-blur-sm 
            shadow-lg shadow-black/5 dark:shadow-black/20
            hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30
            hover:scale-[1.02] hover:-translate-y-1
            transition-all duration-300
            group overflow-hidden relative
          `}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent dark:from-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="pb-2.5 relative z-10">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {c.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            {isLoading ? (
              <Skeleton className="h-9 w-32" />
            ) : (
              <div className="text-2xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                {typeof c.value === "number"
                  ? c.label.includes("Invoice") || c.label.includes("Document")
                    ? c.value.toLocaleString()
                    : formatCurrency(c.value)
                  : "—"}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

