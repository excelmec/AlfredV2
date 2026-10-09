import { CaretUpDownIcon, SignInIcon, SignOutIcon } from '@phosphor-icons/react';
import { UserDatatype } from 'Contexts/User/UserContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Button } from '@/Components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { SidebarMenuButton, useSidebar } from '@/Components/ui/sidebar';
import { Skeleton } from '@/Components/ui/skeleton';

interface UserLoginAvatarButtonProps {
  userLoading: boolean;
  userData: UserDatatype;
  logout: () => void;
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function UserLoginAvatarButton({
  userLoading,
  userData,
  logout,
}: UserLoginAvatarButtonProps) {
  const authRedirUrl = import.meta.env.REACT_APP_AUTH_REDIR_URL;
  const { isMobile } = useSidebar();

  if (!authRedirUrl) {
    throw new Error('REACT_APP_AUTH_REDIR_URL not set');
  }

  if (userLoading) {
    return (
      <div className="flex items-center gap-2 p-2">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="h-4 flex-1" />
      </div>
    );
  }

  if (!userData.loggedIn) {
    const currentUrl = new URL(window.location.href);
    const loginUrl = new URL(authRedirUrl);
    loginUrl.searchParams.append('redirect_to', currentUrl.toString());

    return (
      <Button asChild className="w-full">
        <a href={loginUrl.toString()}>
          <SignInIcon weight="bold" />
          <span className="group-data-[collapsible=icon]:hidden">Login</span>
        </a>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="size-8">
            <AvatarImage
              src={userData.profilePictureUrl}
              alt={userData.name}
              referrerPolicy="no-referrer"
            />
            <AvatarFallback>{initials(userData.name)}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{userData.name}</span>
            <span className="truncate text-xs text-muted-foreground">{userData.email}</span>
          </div>
          <CaretUpDownIcon className="ml-auto size-4" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
        side={isMobile ? 'bottom' : 'right'}
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold">{userData.name}</span>
            <span className="text-xs text-muted-foreground">{userData.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={logout}>
          <SignOutIcon /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
