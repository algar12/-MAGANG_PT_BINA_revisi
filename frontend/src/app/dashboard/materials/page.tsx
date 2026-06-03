"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Material } from "@/lib/types";
import { Package, Plus, Search, Check, X, Edit2, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

const fmt = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ kode_produk: "", nama_produk: "", uom_dasar: "GRAM", standart_cost: "" });

  const fetchMaterials = () => {
    setLoading(true);
    api.get("/materials")
      .then(res => setMaterials(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const filtered = materials.filter((m) => {
    const q = search.toLowerCase();
    return m.nama_produk.toLowerCase().includes(q) || m.kode_produk.toLowerCase().includes(q);
  });

  const openAddDialog = () => {
    setIsEditMode(false);
    setEditId(null);
    setForm({ kode_produk: "", nama_produk: "", uom_dasar: "GRAM", standart_cost: "" });
    setDialogOpen(true);
  };

  const openEditDialog = (m: Material) => {
    setIsEditMode(true);
    setEditId(m.id);
    setForm({ 
      kode_produk: m.kode_produk, 
      nama_produk: m.nama_produk, 
      uom_dasar: m.uom_dasar, 
      standart_cost: m.standart_cost.toString() 
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.kode_produk || !form.nama_produk) return alert("Kode dan Nama produk wajib diisi!");
    
    setIsSubmitting(true);
    try {
      const payload = {
        kode_produk: form.kode_produk,
        nama_produk: form.nama_produk,
        uom_dasar: form.uom_dasar,
        standart_cost: Number(form.standart_cost) || 0,
        is_active: true
      };

      if (isEditMode && editId) {
        await api.put(`/materials/${editId}`, payload);
      } else {
        await api.post("/materials", payload);
      }
      
      setDialogOpen(false);
      fetchMaterials();
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.message || "Gagal menyimpan bahan baku");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus bahan baku ini secara permanen?")) return;
    try {
      await api.delete(`/materials/${id}`);
      fetchMaterials();
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus bahan baku.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bahan Baku</h1>
          <p className="text-muted-foreground text-sm mt-1">Master data material (tabel: materials)</p>
        </div>
        <Button onClick={openAddDialog} className="gradient-teal text-white shadow-md hover:opacity-90 cursor-pointer">
          <Plus className="w-4 h-4 mr-2" />Tambah Material
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass-strong border-border/30 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Bahan Baku" : "Tambah Bahan Baku"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Kode Produk</Label>
              <Input placeholder="RM-001" value={form.kode_produk} onChange={(e) => setForm({ ...form, kode_produk: e.target.value })} className="bg-secondary/50" />
            </div>
            <div className="space-y-2">
              <Label>Nama Produk</Label>
              <Input placeholder="Tepung Terigu" value={form.nama_produk} onChange={(e) => setForm({ ...form, nama_produk: e.target.value })} className="bg-secondary/50" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>UOM Dasar</Label>
                <select value={form.uom_dasar} onChange={(e) => setForm({ ...form, uom_dasar: e.target.value })} className="flex h-10 w-full rounded-md border border-border/50 bg-[#151518] px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer">
                  <option value="GRAM" className="bg-[#151518] text-foreground">GRAM</option>
                  <option value="KG" className="bg-[#151518] text-foreground">KG</option>
                  <option value="PCS" className="bg-[#151518] text-foreground">PCS</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Standart Cost (Rp)</Label>
                <Input type="number" placeholder="11500" value={form.standart_cost} onChange={(e) => setForm({ ...form, standart_cost: e.target.value })} className="bg-secondary/50" />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="gradient-teal text-white">
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="glass border-border/30 animate-slide-up">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Cari kode atau nama produk..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/50" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-border/30 animate-slide-up" style={{ animationDelay: "100ms" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />Daftar Bahan Baku
            <Badge variant="secondary" className="ml-2 text-[10px]">{filtered.length} items</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-lg border border-border/30 overflow-hidden overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30 hover:bg-secondary/30 border-border/30">
                  <TableHead className="text-xs w-12">ID</TableHead>
                  <TableHead className="text-xs">Kode Produk</TableHead>
                  <TableHead className="text-xs">Nama Produk</TableHead>
                  <TableHead className="text-xs text-center">UOM</TableHead>
                  <TableHead className="text-xs text-right">Standart Cost</TableHead>
                  <TableHead className="text-xs text-center">Aktif</TableHead>
                  <TableHead className="text-xs text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-12">Data tidak ditemukan.</TableCell></TableRow>
                ) : (
                  filtered.map((m) => (
                    <TableRow key={m.id} className="border-border/20 hover:bg-secondary/20 transition-colors">
                      <TableCell className="font-mono text-xs text-muted-foreground">{m.id}</TableCell>
                      <TableCell className="font-mono text-xs text-primary font-semibold">{m.kode_produk}</TableCell>
                      <TableCell className="font-medium text-sm">{m.nama_produk}</TableCell>
                      <TableCell className="text-center"><Badge variant="secondary" className="text-[10px]">{m.uom_dasar}</Badge></TableCell>
                      <TableCell className="text-right font-semibold text-sm">{fmt(m.standart_cost)}</TableCell>
                      <TableCell className="text-center">
                        {m.is_active ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-destructive mx-auto" />}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button size="icon" variant="ghost" onClick={() => openEditDialog(m)} className="w-8 h-8 text-muted-foreground hover:text-primary cursor-pointer">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDelete(m.id)} className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
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
