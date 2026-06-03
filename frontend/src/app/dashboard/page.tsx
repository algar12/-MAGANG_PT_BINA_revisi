"use client";

import { useEffect, useState, useMemo } from "react";
import { StatsCards } from "@/components/stats-cards";
import { RealtimeWeightCard } from "@/components/realtime-weight";
import { WeightChart } from "@/components/weight-chart";
import { useRealtimeWeight } from "@/hooks/use-realtime-weight";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const [costings, setCostings] = useState<any[]>([]);
  const realtimeWeight = useRealtimeWeight("TIMBANGAN-01");

  useEffect(() => {
    api.get("/costing-all")
      .then(res => setCostings(res.data.data))
      .catch(err => console.error("Error fetching costings for dashboard:", err));
  }, []);

  const stats = useMemo(() => {
    const ditimbang = costings.length;
    const disetujui = costings.filter(c => c.status === "Completed").length;
    const totalKg = costings.reduce((acc, curr) => acc + (curr.netto_produksi || 0), 0);
    // Asumsikan online jika ada data dalam 5 detik terakhir, atau cukup status connected (true/false)
    const iotOnline = realtimeWeight.weight !== null ? 1 : 0; 
    
    return {
      totalPenimbanganHariIni: ditimbang,
      totalWeighed: costings.filter(c => c.status === "Weighed").length,
      totalPending: costings.filter(c => c.status === "Pending").length,
      totalCompleted: disetujui,
      totalCostHariIni: costings.reduce((acc, curr) => acc + (curr.sub_cost_price || 0), 0),
      activeDevices: iotOnline,
    };
  }, [costings, realtimeWeight.weight]);

  const chartData = useMemo(() => {
    // Generate simple chart data from costings
    const data = [];
    const grouped: Record<string, number> = {};
    
    // Group by hour or just take latest 10
    costings.slice(0, 20).reverse().forEach(c => {
      const time = new Date(c.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      grouped[time] = (grouped[time] || 0) + (c.netto_produksi || 0);
    });

    for (const [time, weight] of Object.entries(grouped)) {
      data.push({ time, weight, target: weight > 0 ? weight + 0.5 : 0 }); // dummy target
    }
    
    // Fallback if empty
    if (data.length === 0) {
      return [
        { time: "08:00", weight: 0, target: 0 },
        { time: "09:00", weight: 0, target: 0 },
      ];
    }
    return data;
  }, [costings]);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitoring penimbangan & perangkat IoT secara realtime
        </p>
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <RealtimeWeightCard data={realtimeWeight} />
        </div>
        <div className="lg:col-span-3">
          <WeightChart data={chartData} />
        </div>
      </div>
    </div>
  );
}
