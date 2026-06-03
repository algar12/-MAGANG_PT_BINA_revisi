"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Scale, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/login", {
        email,
        password,
      });

      if (response.data.success && response.data.token) {
        // Simpan token dan data user
        localStorage.setItem("auth_token", response.data.token);
        localStorage.setItem("user_data", JSON.stringify(response.data.user));
        
        router.push("/dashboard");
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Gagal menghubungi server. Pastikan backend aktif.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.10_0.02_260)] via-[oklch(0.13_0.01_240)] to-[oklch(0.10_0.03_200)]" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-[oklch(0.72_0.17_175_/_8%)] blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-[oklch(0.65_0.15_250_/_8%)] blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />

      {/* Login Card */}
      <Card className="relative z-10 w-full max-w-md mx-4 glass-strong border-0 shadow-2xl animate-fade-in" id="login-card">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl gradient-teal flex items-center justify-center glow-teal">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Smart Weighing System
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            IoT Dashboard — Masuk ke akun Anda
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@smart.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-secondary/50 border-border/50 focus:border-primary transition-colors"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-secondary/50 border-border/50 focus:border-primary transition-colors"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-destructive text-sm text-center animate-fade-in">
                {error}
              </p>
            )}

            <Button
              type="submit"
              id="login-button"
              disabled={loading}
              className="w-full h-11 gradient-teal text-white font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Demo: <span className="text-foreground/80">admin@smart.io</span> /{" "}
            <span className="text-foreground/80">admin123</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
