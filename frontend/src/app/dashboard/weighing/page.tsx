"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import type { ProductionCosting, ProductionOrder } from "@/lib/types";
import { PlayCircle, CheckCircle, Clock, AlertCircle, DollarSign, Loader2, Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { getEcho } from "@/lib/echo";

const fmtRp = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const statusConfig: Record<string, { icon: typeof CheckCircle; cls: string }> = {
  Pending: { icon: Clock, cls: "bg-muted text-muted-foreground hover:bg-muted" },
  Weighed: { icon: AlertCircle, cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15" },
  Completed: { icon: CheckCircle, cls: "bg-primary/15 text-primary border-primary/20 hover:bg-primary/15" },
};

export default function WeighingPage() {
  const [costings, setCostings] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<ProductionOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingCostings, setLoadingCostings] = useState(false);
  const [materials, setMaterials] = useState<any[]>([]);

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newOrderMaterial, setNewOrderMaterial] = useState("");
  const [newOrderQty, setNewOrderQty] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit State
  const [editingCostingId, setEditingCostingId] = useState<number | null>(null);
  const [editWeightValue, setEditWeightValue] = useState("");

  const fetchActiveOrders = useCallback(() => {
    setLoadingOrders(true);
    api.get("/production-orders/active")
      .then((res) => {
        setActiveOrders(res.data.data);
        if (res.data.data.length > 0 && selectedOrder === null) {
          setSelectedOrder(res.data.data[0].id);
        }
      })
      .catch((err) => console.error("Error fetching active orders:", err))
      .finally(() => setLoadingOrders(false));
  }, [selectedOrder]);

  useEffect(() => {
    fetchActiveOrders();
    // Fetch materials for dropdown
    api.get("/materials").then(res => setMaterials(res.data.data));
  }, [fetchActiveOrders]);

  const fetchCostings = useCallback((orderId: number) => {
    setLoadingCostings(true);
    api.get(`/costing-live/${orderId}`)
      .then((res) => {
        setCostings(res.data.data);
      })
      .catch((err) => console.error("Error fetching costings:", err))
      .finally(() => setLoadingCostings(false));
  }, []);

  useEffect(() => {
    if (selectedOrder !== null) {
      fetchCostings(selectedOrder);

      const echo = getEcho();
      if (echo) {
        const channel = echo.channel(`costing.${selectedOrder}`);
        channel.listen('.costing.updated', (e: any) => {
          if (e.costing) {
            setCostings((prev) => {
              const exists = prev.find(c => c.id === e.costing.id);
              if (exists) {
                return prev.map(c => c.id === e.costing.id ? { ...c, ...e.costing } : c);
              } else {
                return [...prev, e.costing];
              }
            });
          } else {
            fetchCostings(selectedOrder);
          }
        });
        return () => {
          channel.stopListening('.costing.updated');
          echo.leaveChannel(`costing.${selectedOrder}`);
        };
      }
    } else {
      setCostings([]);
    }
  }, [selectedOrder, fetchCostings]);

  const handleCreateOrder = async () => {
    if (!newOrderMaterial) return alert("Pilih bahan baku!");
    setIsSubmitting(true);
    try {
      const res = await api.post("/production-orders", {
        material_id: newOrderMaterial,
        qty_target: newOrderQty
      });
      setIsCreateOpen(false);
      setNewOrderMaterial("");
      setNewOrderQty("1");
      fetchActiveOrders();
      setSelectedOrder(res.data.data.id);
    } catch (e) {
      console.error(e);
      alert("Gagal membuat penimbangan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOrder = async (id: number) => {
    if (!confirm("Hapus sesi penimbangan ini?")) return;
    try {
      await api.delete(`/production-orders/${id}`);
      if (selectedOrder === id) setSelectedOrder(null);
      fetchActiveOrders();
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus.");
    }
  };

  const handleSaveEditWeight = async (costingId: number) => {
    if (!editWeightValue) return;
    try {
      await api.put(`/costings/${costingId}`, {
        netto_produksi: editWeightValue
      });
      setEditingCostingId(null);
      setEditWeightValue("");
      fetchCostings(selectedOrder!);
    } catch (e) {
      console.error(e);
      alert("Gagal mengupdate berat.");
    }
  };

  const totalCost = costings.reduce((a, c) => a + (c.sub_cost_price ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mulai Menimbang</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Buat sesi penimbangan baru, pilih bahan baku, dan pantau otomatisasi IoT.
          </p>
        </div>
        
        <Button onClick={() => setIsCreateOpen(true)} className="gradient-teal text-white shadow-lg cursor-pointer">
          <Plus className="w-4 h-4 mr-2" /> Mulai Penimbangan Baru
        </Button>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Buat Penimbangan Baru</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="material">Pilih Bahan Baku</Label>
                <select 
                  id="material"
                  className="flex h-10 w-full rounded-md border border-border/50 bg-[#151518] px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                  value={newOrderMaterial}
                  onChange={(e) => setNewOrderMaterial(e.target.value)}
                >
                  <option value="" className="bg-[#151518] text-muted-foreground">-- Pilih Bahan --</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id} className="bg-[#151518] text-foreground">
                      {m.nama_produk} ({m.kode_produk})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="qty">Kuantitas Target</Label>
                <Input 
                  id="qty" 
                  type="number" 
                  min="1" 
                  value={newOrderQty} 
                  onChange={(e) => setNewOrderQty(e.target.value)} 
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Batal</Button>
              <Button onClick={handleCreateOrder} disabled={isSubmitting || !newOrderMaterial}>
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Buat Sesi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass border-border/30 animate-slide-up">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">Sesi Aktif:</span>
            <div className="flex gap-2 flex-wrap items-center">
              {loadingOrders ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : activeOrders.length === 0 ? (
                <span className="text-xs text-muted-foreground">Tidak ada penimbangan aktif.</span>
              ) : (
                activeOrders.map((o) => (
                  <div key={o.id} className="flex items-center">
                    <Button
                      size="sm"
                      variant={selectedOrder === o.id ? "default" : "outline"}
                      onClick={() => setSelectedOrder(o.id)}
                      className={cn(
                        "text-xs cursor-pointer rounded-r-none border-r-0",
                        selectedOrder === o.id ? "gradient-teal text-white" : "border-border/50"
                      )}
                    >
                      {o.batch_number}
                    </Button>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={() => handleDeleteOrder(o.id)}
                      className={cn("h-8 w-8 rounded-l-none cursor-pointer border-l-border/20", selectedOrder === o.id ? "bg-teal-700/50 text-white border-teal-600 hover:bg-red-500 hover:text-white" : "border-border/50 hover:bg-red-500 hover:text-white")}
                      title="Batalkan Sesi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 flex-wrap animate-slide-up">
        {(["Pending", "Weighed", "Completed"] as const).map((st) => {
          const cfg = statusConfig[st];
          const count = costings.filter((c) => c.status === st).length;
          return (
            <Badge key={st} variant="secondary" className={cn("text-xs", cfg.cls)}>
              <cfg.icon className="w-3 h-3 mr-1" />{st}: {count}
            </Badge>
          );
        })}
        <Badge variant="secondary" className="text-xs bg-primary/15 text-primary border-primary/20 hover:bg-primary/15 ml-auto">
          <DollarSign className="w-3 h-3 mr-1" />Total Cost: {fmtRp(totalCost)}
        </Badge>
      </div>

      <Card className="glass border-border/30 animate-slide-up" style={{ animationDelay: "100ms" }}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <PlayCircle className="w-4 h-4 text-primary" />Weighing Tracking
              <Badge variant="secondary" className="ml-2 text-[10px]">{costings.length} items</Badge>
            </CardTitle>
            {selectedOrder && (
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live — costing.{selectedOrder}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-lg border border-border/30 overflow-hidden overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30 hover:bg-secondary/30 border-border/30">
                  <TableHead className="text-xs">Material</TableHead>
                  <TableHead className="text-xs text-right">Target Qty</TableHead>
                  <TableHead className="text-xs text-center">UOM</TableHead>
                  <TableHead className="text-xs text-right font-semibold">Actual Weight</TableHead>
                  <TableHead className="text-xs text-right">Price</TableHead>
                  <TableHead className="text-xs text-right">Sub Cost</TableHead>
                  <TableHead className="text-xs text-center">Status</TableHead>
                  <TableHead className="text-xs">Device</TableHead>
                  <TableHead className="text-xs text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingCostings ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
                ) : costings.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-12">Pilih order di atas untuk melihat proses penimbangan.</TableCell></TableRow>
                ) : (
                  costings.map((c) => {
                    const cfg = statusConfig[c.status];
                    const StatusIcon = cfg?.icon || Clock;
                    const isEditing = editingCostingId === c.id;

                    return (
                      <TableRow key={c.id} className="border-border/20 hover:bg-secondary/20 transition-colors">
                        <TableCell>
                          <p className="text-sm font-medium">{c.material_name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{c.material_kode}</p>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">{c.qty_required}</TableCell>
                        <TableCell className="text-center"><Badge variant="secondary" className="text-[10px]">{c.uom}</Badge></TableCell>
                        <TableCell className="text-right">
                          {isEditing ? (
                            <Input 
                              type="number" 
                              className="w-24 h-7 text-xs text-right inline-block" 
                              value={editWeightValue}
                              onChange={(e) => setEditWeightValue(e.target.value)}
                              autoFocus
                            />
                          ) : c.netto_produksi != null ? (
                            <span className="font-mono font-bold text-primary text-sm">{Number(c.netto_produksi).toFixed(1)} {c.uom}</span>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">Menunggu...</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-xs font-mono">{fmtRp(c.price_bom)}</TableCell>
                        <TableCell className="text-right font-semibold text-sm">
                          {c.sub_cost_price != null ? <span className="text-emerald-400">{fmtRp(c.sub_cost_price)}</span> : "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="default" className={cn("text-[10px]", cfg?.cls)}>
                            <StatusIcon className="w-3 h-3 mr-1" />{c.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{c.device_name ?? "—"}</TableCell>
                        <TableCell className="text-center">
                          {isEditing ? (
                            <div className="flex gap-1 justify-center">
                              <Button size="icon" variant="ghost" onClick={() => handleSaveEditWeight(c.id)} className="w-6 h-6 text-emerald-400 hover:text-emerald-300">
                                <Save className="w-3 h-3" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => setEditingCostingId(null)} className="w-6 h-6 text-muted-foreground hover:text-white">
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button size="icon" variant="ghost" onClick={() => { setEditingCostingId(c.id); setEditWeightValue(c.netto_produksi || ""); }} className="w-6 h-6 text-muted-foreground hover:text-primary">
                              <Edit2 className="w-3 h-3" />
                            </Button>
                          )}
                        </TableCell>
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
