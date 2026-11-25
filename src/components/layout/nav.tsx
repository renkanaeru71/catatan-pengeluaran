"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CalendarDays,
  CalendarRange,
  Calendar,
  MoreHorizontal,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/harian", label: "Harian", icon: CalendarDays },
  { href: "/mingguan", label: "Mingguan", icon: CalendarRange },
  { href: "/bulanan", label: "Bulanan", icon: Calendar },
] as const;

const SECONDARY_ITEMS = [
  { href: "/transaksi", label: "Transaksi" },
  { href: "/kategori", label: "Kategori" },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Mobile bottom tab bar. */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi utama"
      className="bg-background/95 supports-backdrop-filter:backdrop-blur fixed inset-x-0 bottom-0 z-40 border-t md:hidden"
    >
      <ul className="flex items-stretch justify-around pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[0.7rem] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
        <li className="flex-1">
          <Link
            href="/transaksi"
            aria-current={
              isActive(pathname, "/transaksi") || isActive(pathname, "/kategori")
                ? "page"
                : undefined
            }
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 text-[0.7rem] font-medium transition-colors",
              isActive(pathname, "/transaksi") || isActive(pathname, "/kategori")
                ? "text-primary"
                : "text-muted-foreground",
            )}
          >
            <MoreHorizontal className="size-5" aria-hidden="true" />
            Lainnya
          </Link>
        </li>
      </ul>
    </nav>
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

        {SECONDARY_ITEMS.map(({ href, label }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
