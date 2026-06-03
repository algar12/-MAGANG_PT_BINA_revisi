"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileSpreadsheet, Download, CheckCircle, Clock, AlertCircle, CalendarDays, DollarSign, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

const fmtRp = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const statusConfig: Record<string, { icon: typeof CheckCircle; cls: string }> = {
  Pending: { icon: Clock, cls: "bg-muted text-muted-foreground hover:bg-muted" },
  Weighed: { icon: CheckCircle, cls: "bg-blue-500/15 text-blue-400 border-blue-500/20 hover:bg-blue-500/15" },
  Completed: { icon: CheckCircle, cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15" },
  Rejected: { icon: AlertCircle, cls: "bg-destructive/15 text-destructive border-destructive/20 hover:bg-destructive/15" },
};

export default function RecordsPage() {
  const [costings, setCostings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState<"today" | "this_month" | "this_year">("this_year");

  useEffect(() => {
    api.get("/costing-all")
      .then((res) => {
        setCostings(res.data.data);
      })
      .catch((err) => console.error("Error fetching costings:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    return costings.filter((c) => {
      const d = new Date(c.created_at);
      switch (filterPeriod) {
        case "today": return d.toDateString() === now.toDateString();
        case "this_month": return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        case "this_year": return d.getFullYear() === now.getFullYear();
      }
    });
  }, [filterPeriod, costings]);

  const exportCSV = () => {
    const label = filterPeriod === "today" ? "Hari_Ini" : filterPeriod === "this_month" ? "Bulan_Ini" : "Tahun_Ini";
    const headers = [
      "Batch Number", "Material", "Kode", "Device", "Qty Required", "UOM",
      "Netto Produksi", "Price BOM", "Sub Cost Price", "Status",
    ];
    const rows = filtered.map((c) => [
      c.batch_number, c.material_name, c.material_kode, c.device_name,
      c.qty_required, c.uom, c.netto_produksi ?? "",
      c.price_bom, c.sub_cost_price ?? "", c.status,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `Export_Penimbangan_${label}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalCost = filtered.reduce((a, c) => a + (c.sub_cost_price ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Penimbangan</h1>
          <p className="text-muted-foreground text-sm mt-1">Filter & Export data penimbangan per periode</p>
        </div>
        <Button onClick={exportCSV} variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 cursor-pointer">
          <Download className="w-4 h-4 mr-2" />
          Export {filterPeriod === "today" ? "Hari Ini" : filterPeriod === "this_month" ? "Bulan Ini" : "Tahun Ini"}
        </Button>
      </div>

      {/* Filter bar */}
      <Card className="glass border-border/30 animate-slide-up">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <CalendarDays className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm font-medium text-muted-foreground">Tampilkan:</span>
            <div className="flex gap-2">
              {([
                { key: "today" as const, label: "Hari Ini" },
                { key: "this_month" as const, label: "Bulan Ini" },
                { key: "this_year" as const, label: "Tahun Ini" },
              ]).map((p) => (
                <Button
                  key={p.key}
                  size="sm"
                  variant={filterPeriod === p.key ? "default" : "outline"}
                  onClick={() => setFilterPeriod(p.key)}
                  className={cn("text-xs cursor-pointer", filterPeriod === p.key ? "gradient-teal text-white" : "border-border/50")}
                >
                  {p.label}
                </Button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">{filtered.length} records</Badge>
              <Badge variant="secondary" className="text-xs bg-primary/15 text-primary border-primary/20 hover:bg-primary/15">
                <DollarSign className="w-3 h-3 mr-1" />{fmtRp(totalCost)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="glass border-border/30 animate-slide-up" style={{ animationDelay: "100ms" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-primary" />Riwayat Penimbangan
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-lg border border-border/30 overflow-hidden overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30 hover:bg-secondary/30 border-border/30">
                  <TableHead className="text-xs">Batch</TableHead>
                  <TableHead className="text-xs">Material</TableHead>
                  <TableHead className="text-xs text-right">Required</TableHead>
                  <TableHead className="text-xs text-right">Actual</TableHead>
                  <TableHead className="text-xs text-right">Price BOM</TableHead>
                  <TableHead className="text-xs text-right">Sub Cost</TableHead>
                  <TableHead className="text-xs text-center">Status</TableHead>
                  <TableHead className="text-xs">Device</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-12">Tidak ada data untuk periode ini.</TableCell></TableRow>
                ) : (
                  filtered.map((c) => {
                    const cfg = statusConfig[c.status];
                    const StatusIcon = cfg?.icon || Clock;
                    return (
                      <TableRow key={c.id} className="border-border/20 hover:bg-secondary/20 transition-colors">
                        <TableCell className="font-mono text-xs font-semibold text-primary">{c.batch_number}</TableCell>
                        <TableCell>
                          <p className="text-sm font-medium">{c.material_name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{c.material_kode}</p>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">{c.qty_required} {c.uom}</TableCell>
                        <TableCell className="text-right font-mono font-semibold text-sm">
                          {c.netto_produksi != null ? <span className="text-primary">{c.netto_produksi.toFixed(1)} {c.uom}</span> : "—"}
                        </TableCell>
                        <TableCell className="text-right text-xs">{fmtRp(c.price_bom)}</TableCell>
                        <TableCell className="text-right font-semibold text-sm">
                          {c.sub_cost_price != null ? <span className="text-emerald-400">{fmtRp(c.sub_cost_price)}</span> : "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="default" className={cn("text-[10px]", cfg?.cls)}>
                            <StatusIcon className="w-3 h-3 mr-1" />{c.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{c.device_name ?? "—"}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
