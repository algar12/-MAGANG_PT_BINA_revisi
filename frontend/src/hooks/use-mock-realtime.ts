"use client";

import { useState, useEffect, useCallback } from "react";
import type { RealtimeWeight } from "@/lib/types";
import { getMockRealtimeWeight } from "@/lib/mock-data";

/**
 * Simulasi WebSocket listener: scale.{device_id} → weight.received
 * Di production: gunakan Laravel Echo + Reverb
 *
 * window.Echo.channel('scale.TIMBANGAN-01')
 *   .listen('.weight.received', (event) => setData(event))
 */
export function useMockRealtime(intervalMs: number = 2000) {
  const [data, setData] = useState<RealtimeWeight>({
    device_id: "TIMBANGAN-01",
    device_name: "Timbangan Produksi A",
    weight: null,
    unit: "gr",
    timestamp: new Date().toISOString(),
  });

  const refresh = useCallback(() => {
    setData(getMockRealtimeWeight());
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, refresh]);

  return data;
}
