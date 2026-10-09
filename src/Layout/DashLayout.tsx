import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from '@/Components/ui/sonner';
import { Separator } from '@/Components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/Components/ui/sidebar';
import { ThemeToggle } from '@/Components/theme-toggle';
import AppSidebar from 'Components/Dashboard/Sidebar/Sidebar';
import { sectionTitleForPath } from 'Components/Dashboard/Sidebar/navigation';

export default function DashLayout() {
  const { pathname } = useLocation();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 data-[orientation=vertical]:h-4" />
          <h1 className="text-sm font-semibold tracking-tight">{sectionTitleForPath(pathname)}</h1>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
      <Toaster richColors closeButton position="top-right" />
    </SidebarProvider>
  );
}
