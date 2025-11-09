"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, MessageSquare } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Chat with Data",
    href: "/chat",
    icon: MessageSquare,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border/40 bg-background/95 backdrop-blur-md dark:bg-background/90">
      <div className="flex h-16 items-center justify-between border-b border-border/40 px-6">
        <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Flowbit
        </h1>
        <ThemeToggle />
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href === "/" && pathname === "/dashboard");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative group",
                isActive
                  ? "bg-gradient-to-r from-primary/10 to-primary/5 text-foreground shadow-lg shadow-primary/5 border border-primary/20"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:translate-x-1"
              )}
            >
              <item.icon className={cn(
                "h-4 w-4 transition-transform duration-200",
                isActive && "scale-110"
              )} />
              <span className="relative z-10">{item.name}</span>
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-primary to-primary/50 rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

