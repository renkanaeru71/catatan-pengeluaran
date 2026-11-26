import { DesktopSidebar, BottomNav } from "@/components/layout/nav";
import {
  QuickAddProvider,
  QuickAddHeaderButton,
  QuickAddFab,
} from "@/components/layout/quick-add";
import { getCategoryOptions } from "@/server/queries/category-queries";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const categories = await getCategoryOptions();

  return (
    <QuickAddProvider categories={categories}>
      <div className="flex min-h-screen">
        <DesktopSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-border/60 bg-background/80 supports-backdrop-filter:backdrop-blur sticky top-0 z-30 hidden h-14 items-center justify-end border-b px-8 md:flex">
            <QuickAddHeaderButton />
          </header>

          <main className="flex-1 px-4 pt-4 pb-28 md:px-8 md:pb-8">
            <div className="mx-auto w-full max-w-3xl">{children}</div>
          </main>
        </div>

        <QuickAddFab />
        <BottomNav />
      </div>
    </QuickAddProvider>
  );
}
