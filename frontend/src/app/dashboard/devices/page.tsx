"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { Device } from "@/lib/types";
import { HardDrive, Plus, MapPin, Settings, Check, X, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDevice, setEditDevice] = useState<Device | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ device_id: "", name: "", location: "" });

  const fetchDevices = () => {
    setLoading(true);
    api.get("/devices")
      .then(res => setDevices(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleSave = async () => {
    if (!form.device_id || !form.name) return alert("Device ID dan Nama wajib diisi!");
    
    setIsSubmitting(true);
    try {
      if (editDevice) {
        await api.put(`/devices/${editDevice.id}`, form);
      } else {
        await api.post("/devices", form);
      }
      setDialogOpen(false);
      fetchDevices();
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.message || "Gagal menyimpan device");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus device ini secara permanen?")) return;
    try {
      await api.delete(`/devices/${id}`);
      fetchDevices();
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus device.");
    }
  };

  const openAdd = () => {
    setEditDevice(null);
    setForm({ device_id: "", name: "", location: "" });
    setDialogOpen(true);
  };

  const openEdit = (d: Device) => {
    setEditDevice(d);
    setForm({ device_id: d.device_id, name: d.name, location: d.location ?? "" });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alat Timbangan</h1>
          <p className="text-muted-foreground text-sm mt-1">Registrasi perangkat ESP32 (tabel: devices)</p>
        </div>
        <Button onClick={openAdd} className="gradient-teal text-white shadow-md hover:opacity-90 cursor-pointer">
          <Plus className="w-4 h-4 mr-2" />Tambah Device
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass-strong border-border/30 sm:max-w-[425px]">
          <DialogHeader><DialogTitle>{editDevice ? "Edit Device" : "Tambah Device Baru"}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Device ID</Label>
              <Input placeholder="TIMBANGAN-XX" value={form.device_id} onChange={(e) => setForm({ ...form, device_id: e.target.value })} disabled={!!editDevice} className="bg-secondary/50" />
            </div>
            <div className="space-y-2">
              <Label>Nama Mesin</Label>
              <Input placeholder="Timbangan Produksi A" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-secondary/50" />
            </div>
            <div className="space-y-2">
              <Label>Lokasi (Area Produksi)</Label>
              <Input placeholder="Lantai Produksi 1" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="bg-secondary/50" />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isSubmitting} className="gradient-teal text-white">
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {editDevice ? "Simpan Perubahan" : "Tambah Device"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      ) : devices.length === 0 ? (
        <div className="text-center text-muted-foreground py-12 border border-dashed border-border/50 rounded-lg">Belum ada device terdaftar.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {devices.map((device, i) => (
            <Card key={device.id} className={cn("glass border-border/30 hover:border-border/60 transition-all duration-300 hover:-translate-y-0.5 animate-slide-up")} style={{ animationDelay: `${i * 50}ms` }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-primary" />{device.name}
                  </CardTitle>
                  <Badge variant={device.is_active ? "default" : "secondary"} className={cn("text-[10px] font-semibold", device.is_active ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20" : "bg-muted text-muted-foreground hover:bg-muted")}>
                    {device.is_active ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                    {device.is_active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-xs">
                  <p className="text-muted-foreground mb-0.5">Device ID</p>
                  <p className="font-mono font-semibold text-primary">{device.device_id}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />{device.location || "—"}
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(device)} className="flex-1 text-xs cursor-pointer border-border/50">
                    <Settings className="w-3 h-3 mr-1.5" />Edit
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(device.id)} className="h-8 w-8 shrink-0 text-muted-foreground hover:text-white hover:bg-red-500 border-border/50 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
