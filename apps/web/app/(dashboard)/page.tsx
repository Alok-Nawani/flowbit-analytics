import OverviewCards from "@/components/OverviewCards";
import InvoiceTrend from "@/components/charts/InvoiceTrend";
import SpendByVendor from "@/components/charts/SpendByVendor";
import SpendByCategory from "@/components/charts/SpendByCategory";
import CashOutflow from "@/components/charts/CashOutflow";
import DataTable from "@/components/DataTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Overview of your invoice analytics and insights
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-8 py-10 space-y-10">
          <OverviewCards />

          <div>
            <Tabs defaultValue="trends" className="space-y-6">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="vendors">Vendors</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
              </TabsList>
              <TabsContent value="trends" className="mt-0">
                <InvoiceTrend />
              </TabsContent>
              <TabsContent value="vendors" className="mt-0">
                <SpendByVendor />
              </TabsContent>
              <TabsContent value="categories" className="mt-0">
                <SpendByCategory />
              </TabsContent>
              <TabsContent value="cashflow" className="mt-0">
                <CashOutflow />
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold tracking-tight">Invoices</h2>
              <p className="text-sm text-muted-foreground mt-1.5">
                Search and filter your invoice records
              </p>
            </div>
            <DataTable />
          </div>
        </div>
      </div>
    </div>
  );
}

