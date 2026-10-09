import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { PageLoading } from '@/Components/page-state';
import { Toaster } from '@/Components/ui/sonner';
import { TooltipProvider } from '@/Components/ui/tooltip';
import { Separator } from '@/Components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/Components/ui/sidebar';
import { ThemeToggle } from '@/Components/theme-toggle';
import AppSidebar from 'Components/Dashboard/Sidebar/Sidebar';
import { sectionTitleForPath } from 'Components/Dashboard/Sidebar/navigation';

export default function DashLayout() {
  const { pathname } = useLocation();

  return (
    <TooltipProvider delayDuration={200}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="h-svh min-h-0 min-w-0 overflow-hidden">
          <header className="z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-1 h-4! self-center" />
            <h1 className="text-sm font-semibold tracking-tight">
              {sectionTitleForPath(pathname)}
            </h1>
            <div className="ml-auto flex items-center gap-1">
              <ThemeToggle />
            </div>
          </header>
          <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
            <Suspense fallback={<PageLoading />}>
              <Outlet />
            </Suspense>
          </main>
        </SidebarInset>
        <Toaster richColors closeButton position="top-right" />
      </SidebarProvider>
    </TooltipProvider>
  );
}
