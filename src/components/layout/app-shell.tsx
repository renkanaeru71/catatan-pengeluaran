import { DesktopSidebar, MobileSidebarDrawer } from "@/components/layout/nav";
import {
  QuickAddProvider,
  QuickAddHeaderButton,
  QuickAddFab,
} from "@/components/layout/quick-add";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getCategoryOptions } from "@/server/queries/category-queries";
import { Wallet } from "lucide-react";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const categories = await getCategoryOptions();

  return (
    <QuickAddProvider categories={categories}>
      <div className="flex min-h-screen">
        <DesktopSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-border/60 bg-background/80 supports-backdrop-filter:backdrop-blur sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b px-4 md:justify-end md:px-8">
            <div className="flex items-center gap-2 md:hidden">
              <MobileSidebarDrawer />
              <div className="flex items-center gap-1.5 font-semibold text-sm">
                <Wallet className="text-primary size-5" aria-hidden="true" />
                <span>Catatan</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <QuickAddHeaderButton />
            </div>
          </header>

          <main className="flex-1 px-4 pt-4 pb-8 md:px-8 md:pb-8">
            <div className="mx-auto w-full max-w-3xl">{children}</div>
          </main>
        </div>

        <QuickAddFab />
      </div>
    </QuickAddProvider>
  );
}
