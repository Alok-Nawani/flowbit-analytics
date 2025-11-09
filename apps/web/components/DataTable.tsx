"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";

const INVOICE_STATUSES = ["PENDING", "APPROVED", "PAID", "PARTIALLY_PAID", "OVERDUE", "CANCELLED"];

export default function DataTable() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(50);

  const fetchInvoices = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      take: pageSize.toString(),
    });
    if (search) params.append("q", search);
    if (status) params.append("status", status);

    try {
      const res = await fetch(`/api/invoices?${params}`);
      const data = await res.json();
      setInvoices(data.rows || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchInvoices();
    }, search ? 500 : 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, page]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <Input
          placeholder="Search invoices, vendors, customers..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              {status ? `Status: ${status}` : "All Statuses"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatus(null)}>All Statuses</DropdownMenuItem>
            {INVOICE_STATUSES.map((s) => (
              <DropdownMenuItem key={s} onClick={() => setStatus(s)}>
                {s}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-lg border border-border/40 overflow-hidden bg-card/95 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/40">
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Invoice #</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Vendor</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Customer</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Date</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Due Date</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Amount</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-b border-border/40">
                  <TableCell colSpan={7}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((inv) => (
                <TableRow key={inv.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium text-sm">{inv.invoiceNumber}</TableCell>
                  <TableCell className="text-sm">{inv.vendor}</TableCell>
                  <TableCell className="text-sm">{inv.customer || "—"}</TableCell>
                  <TableCell className="text-sm">{formatDate(inv.invoiceDate)}</TableCell>
                  <TableCell className="text-sm">{formatDate(inv.dueDate)}</TableCell>
                  <TableCell className="text-sm font-medium">{formatCurrency(inv.total, inv.currency)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                        inv.status === "PAID"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : inv.status === "OVERDUE"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
        <div className="text-sm text-muted-foreground">
          Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} invoices
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} size="sm">
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            size="sm"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

