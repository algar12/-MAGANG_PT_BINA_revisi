"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RealtimeWeight } from "@/lib/types";
import { Activity, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveWeightCardProps {
  data: RealtimeWeight;
}

/**
 * LiveWeightCard — Komponen dari ANALISIS_PROJECT.md
 * Subscribe ke: window.Echo.channel('scale.{device_id}')
 *                .listen('.weight.received', (event) => { ... })
 */
export function RealtimeWeightCard({ data }: LiveWeightCardProps) {
  const hasWeight = data.weight != null;

  return (
    <Card
      id="live-weight-card"
      className={cn("glass border-border/30 transition-all duration-500 animate-slide-up", hasWeight ? "glow-weight border-emerald-500/50" : "")}
      style={{ animationDelay: "200ms" }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Live Weight Display
          </CardTitle>
          <Badge
            variant={hasWeight ? "default" : "secondary"}
            className={cn(
              "text-xs font-semibold px-2.5",
              hasWeight
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                : "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
            )}
          >
            <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5 inline-block", hasWeight ? "bg-emerald-400 animate-pulse-soft" : "bg-amber-400 animate-pulse-soft")} />
            {hasWeight ? "Data Received" : "Waiting for Data"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Big weight display */}
        <div className="text-center py-5">
          <span className={cn("text-6xl font-bold tracking-tighter transition-all duration-300 animate-number", hasWeight ? "text-primary" : "text-muted-foreground")}>
            {hasWeight ? data.weight!.toFixed(1) : "—"}
          </span>
          <span className="text-xl font-medium text-muted-foreground ml-2">{data.unit}</span>
        </div>

        {/* Connection status */}
        <div className={cn("text-center py-3 border-t border-b border-border/30 text-xs", hasWeight ? "text-emerald-400" : "text-amber-400")}>
          {hasWeight
            ? "🟢 Connected — Receiving data from ESP32"
            : "🟡 Connected to Server — Waiting for ESP32 data..."
          }
        </div>

        {/* Device info */}
        <div className="grid grid-cols-2 gap-3 pt-3">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Device</p>
            <p className="text-xs font-semibold flex items-center justify-center gap-1">
              {hasWeight ? <Wifi className="w-3 h-3 text-emerald-400" /> : <WifiOff className="w-3 h-3 text-muted-foreground" />}
              {data.device_id}
            </p>
            <p className="text-[10px] text-muted-foreground">{data.device_name}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Timestamp</p>
            <p className="text-xs font-semibold">
              {data.timestamp ? new Date(data.timestamp).toLocaleTimeString("id-ID") : "—"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
