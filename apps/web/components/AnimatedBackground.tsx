"use client";

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/95" />
      
      {/* Aurora-like gradient blobs with enhanced colors for dark mode */}
      <div className="absolute top-0 -left-1/4 w-[900px] h-[900px] bg-[radial-gradient(circle_at_center,_hsl(var(--chart-1)_/_0.12),_transparent_70%)] dark:bg-[radial-gradient(circle_at_center,_hsl(var(--chart-1)_/_0.15),_transparent_70%)] rounded-full blur-[120px] animate-blob-1" />
      <div className="absolute top-1/3 -right-1/4 w-[700px] h-[700px] bg-[radial-gradient(circle_at_center,_hsl(var(--chart-2)_/_0.08),_transparent_70%)] dark:bg-[radial-gradient(circle_at_center,_hsl(var(--chart-2)_/_0.12),_transparent_70%)] rounded-full blur-[120px] animate-blob-2" />
      <div className="absolute bottom-0 left-1/3 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_hsl(var(--chart-5)_/_0.06),_transparent_70%)] dark:bg-[radial-gradient(circle_at_center,_hsl(var(--chart-5)_/_0.1),_transparent_70%)] rounded-full blur-[120px] animate-blob-3" />
      
      {/* Additional subtle accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_hsl(var(--chart-3)_/_0.05),_transparent_70%)] dark:bg-[radial-gradient(circle_at_center,_hsl(var(--chart-3)_/_0.08),_transparent_70%)] rounded-full blur-[100px] animate-blob-4" />
      
      {/* Dark mode specific vibrant accents */}
      <div className="absolute top-1/4 right-1/3 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_hsl(var(--chart-4)_/_0.06),_transparent_70%)] dark:bg-[radial-gradient(circle_at_center,_hsl(var(--chart-4)_/_0.1),_transparent_70%)] rounded-full blur-[100px] animate-blob-5 hidden dark:block" />
    </div>
  );
}

