"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { DashboardStats } from "@/lib/types";
import { Scale, Clock, CheckCircle, HardDrive, DollarSign, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  stats: DashboardStats;
}

const fmtRp = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const cards = [
  { key: "totalPenimbanganHariIni" as const, label: "Total Penimbangan", icon: Scale, gradient: "gradient-teal", format: (v: number) => String(v ?? 0), suffix: "sesi" },
  { key: "totalPending" as const, label: "Status Pending", icon: Clock, gradient: "gradient-amber", format: (v: number) => String(v ?? 0), suffix: "menunggu" },
  { key: "totalWeighed" as const, label: "Status Weighed", icon: AlertCircle, gradient: "gradient-blue", format: (v: number) => String(v ?? 0), suffix: "ditimbang" },
  { key: "totalCompleted" as const, label: "Status Completed", icon: CheckCircle, gradient: "gradient-emerald", format: (v: number) => String(v ?? 0), suffix: "selesai" },
  { key: "totalCostHariIni" as const, label: "Total Cost Hari Ini", icon: DollarSign, gradient: "gradient-teal", format: (v: number) => fmtRp(v ?? 0), suffix: "" },
  { key: "activeDevices" as const, label: "Device Aktif", icon: HardDrive, gradient: "gradient-blue", format: (v: number) => String(v ?? 0), suffix: "online" },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <Card
          key={card.key}
          id={`stat-${card.key}`}
          className={cn("glass border-border/30 hover:border-border/60 transition-all duration-300 hover:-translate-y-0.5 animate-slide-up")}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{card.label}</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-bold tracking-tight animate-number">{card.format(stats[card.key])}</span>
                  {card.suffix && <span className="text-sm text-muted-foreground">{card.suffix}</span>}
                </div>
              </div>
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", card.gradient)}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
