"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CalendarDays,
  CalendarRange,
  Calendar,
  Wallet,
  Menu,
  X,
  Receipt,
  Tags,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/harian", label: "Harian", icon: CalendarDays },
  { href: "/mingguan", label: "Mingguan", icon: CalendarRange },
  { href: "/bulanan", label: "Bulanan", icon: Calendar },
] as const;

const SECONDARY_ITEMS = [
  { href: "/transaksi", label: "Transaksi", icon: Receipt },
  { href: "/kategori", label: "Kategori", icon: Tags },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Mobile slide-over drawer toggle and menu. */
export function MobileSidebarDrawer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function closeDrawer() {
    setOpen(false);
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Buka menu navigasi"
        className="md:hidden"
      >
        <Menu className="size-5" />
      </Button>

      {/* Backdrop */}
      {open && (
        <div
          role="presentation"
          onClick={closeDrawer}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-200 md:hidden animate-in fade-in"
        />
      )}

      {/* Drawer */}
      <aside
        aria-label="Menu navigasi samping"
        className={cn(
          "bg-white dark:bg-zinc-950 fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border p-4 shadow-2xl transition-transform duration-200 ease-in-out md:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-6 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Wallet className="text-primary size-6" aria-hidden="true" />
            <span className="font-semibold">Catatan Pengeluaran</span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={closeDrawer}
            aria-label="Tutup menu"
          >
            <X className="size-5" />
          </Button>
        </div>

        <nav aria-label="Navigasi utama mobile" className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                onClick={closeDrawer}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {label}
              </Link>
            );
          })}

          <div className="bg-border my-3 h-px" />

          {SECONDARY_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                onClick={closeDrawer}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

/** Desktop sidebar. */
export function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-background sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r p-4 md:flex">
      <div className="mb-6 flex items-center gap-2 px-2">
        <Wallet className="text-primary size-6" aria-hidden="true" />
        <span className="font-semibold">Catatan Pengeluaran</span>
      </div>

      <nav aria-label="Navigasi utama" className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          );
        })}

        <div className="bg-border my-2 h-px" />

        {SECONDARY_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
