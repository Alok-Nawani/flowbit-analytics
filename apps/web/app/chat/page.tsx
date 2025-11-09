"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Send } from "lucide-react";

export default function ChatPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    sql?: string;
    columns?: string[];
    rows?: any[][];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/chat-with-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to process query");
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            Chat with Data
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Ask questions in natural language and get instant insights
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-8 py-10 space-y-6">
          <Card className="rounded-xl border border-border/50 bg-card/95 backdrop-blur-sm shadow-lg shadow-black/5 dark:shadow-black/20 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Ask a Question</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Textarea
                      placeholder="e.g., What's the total spend in the last 90 days?"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      rows={4}
                      disabled={loading}
                      className="resize-none border-border/50 focus:border-border"
                    />
                  </div>
                  <div className="flex items-end sm:items-start">
                    <Button 
                      type="submit" 
                      disabled={loading || !question.trim()}
                      size="lg"
                      className="w-full sm:w-auto shadow-sm"
                    >
                      {loading ? (
                        "Processing..."
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Ask
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {error && (
            <Card className="rounded-lg border border-destructive/20 bg-destructive/5">
              <CardContent className="pt-6">
                <p className="text-sm text-destructive font-medium">{error}</p>
              </CardContent>
            </Card>
          )}

          {result && (
            <div className="space-y-6">
              {result.sql && (
                <Card className="rounded-xl border border-border/50 bg-card/95 backdrop-blur-sm shadow-lg shadow-black/5 dark:shadow-black/20 hover:shadow-xl transition-all duration-300">
                  <CardHeader className="border-b border-border/40 pb-4">
                    <CardTitle className="text-base font-semibold">Generated SQL</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <pre className="bg-muted/30 p-4 rounded-md overflow-x-auto text-xs font-mono border border-border/40 text-foreground/90">
                      {result.sql}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {result.columns && result.rows && (
                <Card className="rounded-xl border border-border/50 bg-card/95 backdrop-blur-sm shadow-lg shadow-black/5 dark:shadow-black/20 hover:shadow-xl transition-all duration-300">
                  <CardHeader className="border-b border-border/40 pb-4">
                    <CardTitle className="text-base font-semibold">Results</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="rounded-md border border-border/40 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b border-border/40">
                            {result.columns.map((col) => (
                              <TableHead key={col} className="font-semibold text-xs uppercase tracking-wider">
                                {col}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.rows.length === 0 ? (
                            <TableRow>
                              <TableCell 
                                colSpan={result.columns.length} 
                                className="text-center text-muted-foreground py-12"
                              >
                                No results found
                              </TableCell>
                            </TableRow>
                          ) : (
                            result.rows.map((row, i) => (
                              <TableRow key={i} className="border-b border-border/40">
                                {row.map((cell: any, j: number) => (
                                  <TableCell key={j} className="text-sm">
                                    {typeof cell === "number" && result.columns?.[j]?.toLowerCase().includes("amount")
                                      ? formatCurrency(cell)
                                      : String(cell ?? "—")}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

