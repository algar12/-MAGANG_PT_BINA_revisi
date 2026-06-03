"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface WeightChartProps {
  data: { time: string; weight: number; target: number }[];
}

export function WeightChart({ data }: WeightChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Card id="weight-chart" className="glass border-border/30 animate-slide-up" style={{ animationDelay: "300ms" }}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          Aktivitas Penimbangan (12 jam)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[280px] w-full min-w-0">
          {isMounted ? (
            <ResponsiveContainer width="99%" height={280}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.72 0.17 175)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="oklch(0.72 0.17 175)" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.70 0.18 155)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="oklch(0.70 0.18 155)" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" vertical={false} />
              <XAxis dataKey="time" stroke="oklch(1 0 0 / 30%)" tick={{ fill: "oklch(1 0 0 / 50%)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis stroke="oklch(1 0 0 / 30%)" tick={{ fill: "oklch(1 0 0 / 50%)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{ background: "oklch(0.18 0.005 260 / 95%)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "10px", backdropFilter: "blur(12px)", color: "oklch(0.97 0 0)", fontSize: "12px" }}
                labelStyle={{ color: "oklch(0.65 0 0)", fontWeight: 600 }}
              />
              <Bar dataKey="weight" fill="url(#gradTotal)" name="Berat (kg)" radius={[4, 4, 0, 0]} animationDuration={1500} />
              <Bar dataKey="target" fill="url(#gradCompleted)" name="Target (kg)" radius={[4, 4, 0, 0]} animationDuration={1500} />
            </BarChart>
          </ResponsiveContainer>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
