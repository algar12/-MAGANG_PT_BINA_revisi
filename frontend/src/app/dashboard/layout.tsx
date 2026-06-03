"use client";

import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 min-w-0 min-h-screen transition-all duration-300 md:ml-[72px] lg:ml-[240px] pb-20 md:pb-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
