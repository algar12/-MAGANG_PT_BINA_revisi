"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardList, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { ProductionOrder } from "@/lib/types";

const statusColors: Record<string, string> = {
  "Draft": "bg-muted text-muted-foreground hover:bg-muted",
  "In Progress": "bg-blue-500/15 text-blue-400 border-blue-500/20 hover:bg-blue-500/15",
  "Completed": "bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/production-orders/all")
      .then((res) => {
        setOrders(res.data.data);
      })
      .catch((err) => console.error("Error fetching orders:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight">Production Order</h1>
        <p className="text-muted-foreground text-sm mt-1">Daftar order produksi (tabel: production_orders)</p>
      </div>

      {/* Status badges — alur: Draft → In Progress → Completed */}
      <div className="flex gap-2 flex-wrap animate-slide-up">
        {(["Draft", "In Progress", "Completed"] as const).map((st) => {
          const count = orders.filter((o) => o.status === st).length;
          return (
            <Badge key={st} variant="secondary" className={cn("text-xs", statusColors[st])}>
              {st}: {count}
            </Badge>
          );
        })}
      </div>

      <Card className="glass border-border/30 animate-slide-up" style={{ animationDelay: "100ms" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" />Daftar Production Order
            <Badge variant="secondary" className="ml-2 text-[10px]">{orders.length} records</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-lg border border-border/30 overflow-hidden overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30 hover:bg-secondary/30 border-border/30">
                  <TableHead className="text-xs w-12">ID</TableHead>
                  <TableHead className="text-xs">Batch Number</TableHead>
                  <TableHead className="text-xs">Formula / Resep</TableHead>
                  <TableHead className="text-xs text-center">Qty Target</TableHead>
                  <TableHead className="text-xs">Mulai</TableHead>
                  <TableHead className="text-xs">Selesai</TableHead>
                  <TableHead className="text-xs text-center">Status</TableHead>
                  <TableHead className="text-xs">Operator</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Tidak ada data order.</TableCell>
                  </TableRow>
                ) : (
                  orders.map((o: any) => (
                    <TableRow key={o.id} className="border-border/20 hover:bg-secondary/20 transition-colors">
                      <TableCell className="font-mono text-xs text-muted-foreground">{o.id}</TableCell>
                      <TableCell className="font-mono text-xs font-semibold text-primary">{o.batch_number}</TableCell>
                      <TableCell className="text-sm font-medium">{o.formula?.nama_formula}</TableCell>
                      <TableCell className="text-center font-semibold">{o.qty_target}</TableCell>
                      <TableCell className="text-xs">{new Date(o.start_date).toLocaleDateString("id-ID")}</TableCell>
                      <TableCell className="text-xs">{o.end_date ? new Date(o.end_date).toLocaleDateString("id-ID") : "—"}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className={cn("text-[10px]", statusColors[o.status])}>{o.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">{o.operator?.name ?? "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
