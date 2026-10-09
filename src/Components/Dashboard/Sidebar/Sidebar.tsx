import { useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { CaretRightIcon } from '@phosphor-icons/react';
import UserContext from 'Contexts/User/UserContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/Components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarTrigger,
} from '@/Components/ui/sidebar';
import UserLoginAvatarButton from '../Login/UserLoginAvatarButton';
import { bottomLinks, navGroups, topLinks, type NavLeaf } from './navigation';

export default function AppSidebar() {
  const { userData, userLoading, logout } = useContext(UserContext);
  const { pathname } = useLocation();

  const canSee = (item: NavLeaf) =>
    !item.roles || userData.roles.some((role) => item.roles?.includes(role));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-1">
            <SidebarMenuButton size="lg" asChild tooltip="Alfred">
              <NavLink to="/">
                <img src="/logo.png" alt="Excel" className="size-8 shrink-0 object-contain" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold tracking-tight">Alfred</span>
                  <span className="truncate text-xs text-muted-foreground">Excel Admin</span>
                </div>
              </NavLink>
            </SidebarMenuButton>
            <SidebarTrigger className="shrink-0 group-data-[collapsible=icon]:hidden" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {topLinks.map((item) => (
              <NavItem key={item.to} item={item} pathname={pathname} />
            ))}

            {navGroups.map((group) => {
              const visible = group.items.filter(canSee);
              if (visible.length === 0) return null;
              const active = pathname.startsWith(group.prefix);
              return (
                <Collapsible
                  key={group.prefix}
                  asChild
                  defaultOpen={active}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={group.title} isActive={active}>
                        <group.icon />
                        <span>{group.title}</span>
                        <CaretRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {visible.map((item) => (
                          <SidebarMenuSubItem key={item.to}>
                            <SidebarMenuSubButton asChild isActive={pathname === item.to}>
                              <NavLink to={item.to} end>
                                <item.icon />
                                <span>{item.title}</span>
                              </NavLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}

            {bottomLinks.map((item) => (
              <NavItem key={item.to} item={item} pathname={pathname} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserLoginAvatarButton userLoading={userLoading} userData={userData} logout={logout} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function NavItem({ item, pathname }: { item: NavLeaf; pathname: string }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip={item.title} isActive={pathname === item.to}>
        <NavLink to={item.to} end>
          <item.icon />
          <span>{item.title}</span>
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
