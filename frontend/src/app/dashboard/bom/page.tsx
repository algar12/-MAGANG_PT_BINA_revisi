"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Layers, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

const fmt = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function BomPage() {
  const [boms, setBoms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/formulas")
      .then((res) => {
        const formulas = res.data.data;
        const allBoms: any[] = [];
        formulas.forEach((f: any) => {
          if (f.bom_items) {
            f.bom_items.forEach((b: any) => {
              allBoms.push({
                ...b,
                formula_name: f.nama_formula
              });
            });
          }
        });
        setBoms(allBoms);
      })
      .catch((err) => console.error("Error fetching BOM:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight">BOM Items</h1>
        <p className="text-muted-foreground text-sm mt-1">Bill of Materials — detail bahan per formula (tabel: bom_items)</p>
      </div>

      <Card className="glass border-border/30 animate-slide-up" style={{ animationDelay: "100ms" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />Daftar BOM
            <Badge variant="secondary" className="ml-2 text-[10px]">{boms.length} items</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-lg border border-border/30 overflow-hidden overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30 hover:bg-secondary/30 border-border/30">
                  <TableHead className="text-xs w-12">ID</TableHead>
                  <TableHead className="text-xs">Formula</TableHead>
                  <TableHead className="text-xs">Material</TableHead>
                  <TableHead className="text-xs text-right">Qty Required</TableHead>
                  <TableHead className="text-xs text-center">UOM</TableHead>
                  <TableHead className="text-xs text-right">Standart Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : boms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Tidak ada data BOM.</TableCell>
                  </TableRow>
                ) : (
                  boms.map((b) => (
                    <TableRow key={b.id} className="border-border/20 hover:bg-secondary/20 transition-colors">
                      <TableCell className="font-mono text-xs text-muted-foreground">{b.id}</TableCell>
                      <TableCell className="text-sm font-medium text-primary">{b.formula_name}</TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{b.material?.nama_produk}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{b.material?.kode_produk}</p>
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-sm">{b.qty_required}</TableCell>
                      <TableCell className="text-center"><Badge variant="secondary" className="text-[10px]">{b.uom}</Badge></TableCell>
                      <TableCell className="text-right text-xs">{fmt(b.material?.standart_cost ?? 0)}/{b.material?.uom_dasar}</TableCell>
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
