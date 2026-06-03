import { useState, useEffect } from "react";
import type { RealtimeWeight } from "@/lib/types";
import { getEcho } from "@/lib/echo";

export function useRealtimeWeight(deviceId: string = "SCALE-001") {
  const [weightData, setWeightData] = useState<RealtimeWeight>({
    device_id: deviceId,
    device_name: "Smart Scale",
    weight: null,
    unit: "KG",
    timestamp: "", // Gunakan string kosong agar tidak terjadi Hydration Mismatch saat SSR
  });

  useEffect(() => {
    // Set timestamp saat komponen sudah di-mount di client
    setWeightData(prev => ({ ...prev, timestamp: new Date().toISOString() }));
    const echo = getEcho();
    if (echo) {
      const channel = echo.channel(`scale.${deviceId}`);
      channel.listen('.weight.received', (e: any) => {
        console.log("Reverb WeightReceived Event:", e);
        setWeightData({
          device_id: e.device_id,
          device_name: e.device_name,
          weight: e.weight,
          unit: e.unit,
          timestamp: e.timestamp,
        });
      });

      return () => {
        channel.stopListening('.weight.received');
        echo.leaveChannel(`scale.${deviceId}`);
      };
    }
  }, [deviceId]);

  return weightData;
}
