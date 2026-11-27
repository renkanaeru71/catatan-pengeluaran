"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  navigationService,
  type NavigationItem,
} from "@/lib/navigation/navigation.model";

/**
 * Navigation item link component applying OOP NavigationItem behaviors.
 */
function NavLinkItem({
  item,
  active,
  onClick,
  compact = false,
}: {
  item: NavigationItem;
  active: boolean;
  onClick?: () => void;
  compact?: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg font-medium transition-colors",
        compact ? "px-3 py-2 text-sm" : "px-3 py-2.5 text-sm",
        active
          ? "bg-primary/10 text-primary font-semibold"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className={compact ? "size-4" : "size-5"} aria-hidden="true" />
      <span>{item.label}</span>
    </Link>
  );
}

/**
 * Mobile slide-over drawer navigation.
 * Portaled to document.body to avoid parent backdrop-filter context flattening.
 */
export function MobileSidebarDrawer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const primaryItems = navigationService.getPrimaryItems();
  const secondaryItems = navigationService.getSecondaryItems();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Buka menu navigasi"
            className="md:hidden"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-72 border-r border-border bg-white dark:bg-zinc-950 p-4 shadow-2xl"
      >
        <SheetHeader className="mb-2 p-0">
          <div className="flex items-center gap-2 px-2 py-1">
            <Wallet className="text-primary size-6" aria-hidden="true" />
            <SheetTitle className="text-base font-semibold">
              Catatan Pengeluaran
            </SheetTitle>
          </div>
        </SheetHeader>

        <nav aria-label="Navigasi utama mobile" className="flex flex-1 flex-col gap-1">
          {primaryItems.map((item) => (
            <NavLinkItem
              key={item.href}
              item={item}
              active={item.isActive(pathname)}
              onClick={() => setOpen(false)}
            />
          ))}

          <div className="bg-border my-3 h-px" />

          {secondaryItems.map((item) => (
            <NavLinkItem
              key={item.href}
              item={item}
              active={item.isActive(pathname)}
              onClick={() => setOpen(false)}
            />
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Desktop sidebar navigation.
 */
export function DesktopSidebar() {
  const pathname = usePathname();
  const primaryItems = navigationService.getPrimaryItems();
  const secondaryItems = navigationService.getSecondaryItems();

  return (
    <aside className="bg-background sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r p-4 md:flex">
      <div className="mb-6 flex items-center gap-2 px-2">
        <Wallet className="text-primary size-6" aria-hidden="true" />
        <span className="font-semibold">Catatan Pengeluaran</span>
      </div>

      <nav aria-label="Navigasi utama" className="flex flex-col gap-1">
        {primaryItems.map((item) => (
          <NavLinkItem
            key={item.href}
            item={item}
            active={item.isActive(pathname)}
            compact
          />
        ))}

        <div className="bg-border my-2 h-px" />

        {secondaryItems.map((item) => (
          <NavLinkItem
            key={item.href}
            item={item}
            active={item.isActive(pathname)}
            compact
          />
        ))}
      </nav>
    </aside>
  );
}
