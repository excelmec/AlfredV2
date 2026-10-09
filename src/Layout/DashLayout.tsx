import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ErrorBoundary } from '@/Components/error-boundary';
import { PageLoading } from '@/Components/page-state';
import { Toaster } from '@/Components/ui/sonner';
import { TooltipProvider } from '@/Components/ui/tooltip';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/Components/ui/sidebar';
import AppSidebar from 'Components/Dashboard/Sidebar/Sidebar';

export default function DashLayout() {
  const { pathname } = useLocation();

  return (
    <TooltipProvider delayDuration={200}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="h-svh min-h-0 min-w-0 overflow-hidden">
          <div className="flex h-12 shrink-0 items-center border-b px-3 md:hidden">
            <SidebarTrigger />
            <span className="ml-2 text-sm font-semibold tracking-tight">Alfred</span>
          </div>
          <main className="flex min-h-0 min-w-0 flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-6">
            <ErrorBoundary key={pathname}>
              <Suspense fallback={<PageLoading />}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </main>
        </SidebarInset>
        <Toaster richColors closeButton position="top-right" />
      </SidebarProvider>
    </TooltipProvider>
  );
}
