import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import AnimatedBackground from "@/components/AnimatedBackground";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Flowbit Analytics",
  description: "Invoice analytics and insights dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased relative">
        <ThemeProvider>
          <AnimatedBackground />
          <div className="flex h-screen overflow-hidden relative z-0">
            <Sidebar />
            <main className="flex-1 overflow-y-auto relative z-0">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

