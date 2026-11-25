import { DesktopSidebar, BottomNav } from "@/components/layout/nav";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen">
      <DesktopSidebar />
      <main className="flex-1 px-4 pt-4 pb-24 md:px-8 md:pb-8">
        <div className="mx-auto w-full max-w-3xl">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
