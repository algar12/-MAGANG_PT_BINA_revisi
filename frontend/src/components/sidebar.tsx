"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  HardDrive,
  Scale,
  Package,
  PlayCircle,
  FileSpreadsheet,
  FlaskConical,
  Layers,
  ClipboardList,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Menu sesuai Filament Resources di backend:
// - MaterialResource → Bahan Baku
// - FormulaResource → Formula
// - BomItemResource → BOM Items
// - DeviceResource → Alat Timbangan
// - ProductionOrderResource → Production Order
// - ProductionCostingResource → MULAI MENIMBANG
// + Data Penimbangan (filter + export)
const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, group: null },
  // Master Data
  { label: "Bahan Baku", href: "/dashboard/materials", icon: Package, group: "MASTER DATA" },
  { label: "Alat Timbangan", href: "/dashboard/devices", icon: HardDrive, group: "MASTER DATA" },
  // Penimbangan Utama
  { label: "Mulai Menimbang", href: "/dashboard/weighing", icon: PlayCircle, group: "PENIMBANGAN" },
  { label: "Data Penimbangan", href: "/dashboard/records", icon: FileSpreadsheet, group: "PENIMBANGAN" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
    }
    router.push("/login");
  };

  let lastGroup: string | null = null;

  return (
    <aside
      className={cn(
        "fixed z-40 bg-sidebar border-border/50 transition-all duration-300",
        // Mobile layout (bottom nav)
        "flex bottom-0 left-0 right-0 h-16 flex-row border-t px-2",
        // Desktop layout (left sidebar)
        "md:top-0 md:bottom-auto md:h-screen md:flex-col md:border-r md:border-t-0 md:px-0",
        collapsed ? "md:w-[72px]" : "md:w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="hidden md:flex items-center gap-3 px-4 h-16 shrink-0">
        <div className="w-9 h-9 rounded-lg gradient-teal flex items-center justify-center shrink-0">
          <Scale className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in truncate">
            <p className="font-bold text-sm leading-tight">Smart Timbangan</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Panel Admin</p>
          </div>
        )}
      </div>

      <Separator className="hidden md:block opacity-50" />

      {/* Navigation */}
      <nav className="flex-1 flex flex-row md:flex-col items-center justify-around md:items-stretch md:justify-start gap-1 md:gap-0.5 md:px-3 md:py-4 overflow-x-auto md:overflow-y-auto w-full h-full">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          // Show group label (only on desktop)
          let groupLabel = null;
          if (item.group && item.group !== lastGroup && !collapsed) {
            groupLabel = (
              <p key={`group-${item.group}`} className="hidden md:block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-3 pt-4 pb-1 truncate">
                {item.group}
              </p>
            );
          }
          lastGroup = item.group;

          return (
            <div key={item.href} className="flex-1 md:flex-none">
              {groupLabel}
              <Link
                href={item.href}
                id={`nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
                className={cn(
                  "flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start gap-1 md:gap-3 px-1 md:px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 h-full md:h-auto",
                  isActive
                    ? "text-primary md:bg-sidebar-accent md:text-sidebar-primary"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className={cn("w-5 h-5 md:w-4.5 md:h-4.5 shrink-0", isActive && "text-primary")} />
                {!collapsed && <span className="text-[10px] md:text-[13px] truncate md:block hidden">{item.label}</span>}
              </Link>
            </div>
          );
        })}

        {/* Mobile Logout Button */}
        <div className="flex-1 md:hidden">
          <button
            onClick={handleLogout}
            id="mobile-logout-button"
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-1 py-2 rounded-lg text-xs font-medium transition-all duration-200 h-full w-full",
              "text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="text-[10px] truncate block mt-0.5">Keluar</span>
          </button>
        </div>
      </nav>

      {/* Bottom (Desktop Only) */}
      <div className="hidden md:block px-3 pb-4 space-y-2">
        <Separator className="opacity-50 mb-2" />
        <button
          onClick={handleLogout}
          id="logout-button"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium w-full transition-all duration-200",
            "text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 cursor-pointer"
          )}
        >
          <LogOut className="w-4.5 h-4.5 shrink-0" />
          {!collapsed && <span className="text-[13px]">Keluar</span>}
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-muted-foreground hover:text-foreground cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>
    </aside>
  );
}
