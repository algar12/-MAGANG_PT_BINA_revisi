"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FlaskConical, Check, X, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Formula } from "@/lib/types";

export default function FormulasPage() {
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/formulas")
      .then((res) => {
        setFormulas(res.data.data);
      })
      .catch((err) => console.error("Error fetching formulas:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight">Formula</h1>
        <p className="text-muted-foreground text-sm mt-1">Master data resep/formula produksi (tabel: formulas)</p>
      </div>

      <Card className="glass border-border/30 animate-slide-up" style={{ animationDelay: "100ms" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-primary" />Daftar Formula
            <Badge variant="secondary" className="ml-2 text-[10px]">{formulas.length} items</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-lg border border-border/30 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30 hover:bg-secondary/30 border-border/30">
                  <TableHead className="text-xs w-12">ID</TableHead>
                  <TableHead className="text-xs">Nama Formula</TableHead>
                  <TableHead className="text-xs">Deskripsi</TableHead>
                  <TableHead className="text-xs text-center">Jumlah BOM</TableHead>
                  <TableHead className="text-xs text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : formulas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Tidak ada data formula.</TableCell>
                  </TableRow>
                ) : (
                  formulas.map((f: any) => {
                    const bomCount = f.bom_items?.length || 0;
                    return (
                      <TableRow key={f.id} className="border-border/20 hover:bg-secondary/20 transition-colors">
                        <TableCell className="font-mono text-xs text-muted-foreground">{f.id}</TableCell>
                        <TableCell className="font-medium text-sm">{f.nama_formula}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{f.deskripsi ?? "—"}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="text-[10px]">{bomCount} items</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {f.is_active ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-destructive mx-auto" />}
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
