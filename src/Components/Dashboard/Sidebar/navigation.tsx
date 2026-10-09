import type { Icon } from '@phosphor-icons/react';
import {
  AddressBookIcon,
  CalendarDotsIcon,
  ChartLineUpIcon,
  ClockIcon,
  CreditCardIcon,
  HeadsetIcon,
  ListNumbersIcon,
  MegaphoneIcon,
  PackageIcon,
  QrCodeIcon,
  StorefrontIcon,
  TicketIcon,
  TrayIcon,
  UsersIcon,
  UsersThreeIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { ticketScanRoles } from 'Hooks/Ticket/ticketRoles';
import type { UserRoles } from 'Contexts/User/UserContext';

export interface NavLeaf {
  title: string;
  to: string;
  icon: Icon;
  /** Hide the item unless the user has one of these roles */
  roles?: UserRoles[];
}

export interface NavGroup {
  title: string;
  /** Route prefix that marks the group as active */
  prefix: string;
  icon: Icon;
  items: NavLeaf[];
}

export const topLinks: NavLeaf[] = [{ title: 'Users', to: '/users', icon: UsersIcon }];

export const bottomLinks: NavLeaf[] = [{ title: 'Contact', to: '/contact', icon: AddressBookIcon }];

export const navGroups: NavGroup[] = [
  {
    title: 'Campus Ambassador',
    prefix: '/ca',
    icon: MegaphoneIcon,
    items: [
      { title: 'CA List', to: '/ca/list', icon: ListNumbersIcon },
      { title: 'Team List', to: '/ca/team', icon: UsersThreeIcon },
    ],
  },
  {
    title: 'Events',
    prefix: '/events',
    icon: CalendarDotsIcon,
    items: [
      { title: 'List Events', to: '/events', icon: ListNumbersIcon },
      { title: 'Event Heads', to: '/events/heads', icon: HeadsetIcon },
      {
        title: 'Registration Statistics',
        to: '/events/registrations/statistics',
        icon: ChartLineUpIcon,
      },
      { title: 'Event Schedule', to: '/events/schedule', icon: ClockIcon },
    ],
  },
  {
    title: 'Merchandise',
    prefix: '/merch',
    icon: StorefrontIcon,
    items: [
      { title: 'List Items', to: '/merch/items', icon: PackageIcon },
      {
        title: 'Confirmed Delivery Orders',
        to: '/merch/confirmed_delivery_orders',
        icon: ListNumbersIcon,
      },
      {
        title: 'Confirmed Pickup Orders',
        to: '/merch/confirmed_pickup_orders',
        icon: ListNumbersIcon,
      },
      { title: 'Pre-orders', to: '/merch/preorders', icon: TrayIcon },
      { title: 'Missing Stock', to: '/merch/missing_stock', icon: WarningCircleIcon },
      { title: 'Test Payment', to: '/merch/order/testpayment', icon: CreditCardIcon },
    ],
  },
  {
    title: 'Tickets',
    prefix: '/ticket',
    icon: TicketIcon,
    items: [
      { title: 'Proshows', to: '/tickets/proshows', icon: TicketIcon, roles: ticketScanRoles },
      { title: 'Attendees', to: '/tickets', icon: UsersIcon, roles: ticketScanRoles },
      { title: 'Scan', to: '/tickets/scan', icon: QrCodeIcon, roles: ticketScanRoles },
    ],
  },
];

/** Resolve a human readable page section for the header from the current path */
export function sectionTitleForPath(pathname: string): string {
  const group = navGroups.find((g) => pathname.startsWith(g.prefix));
  if (group) return group.title;
  const link = [...topLinks, ...bottomLinks].find((l) => l.to !== '/' && pathname.startsWith(l.to));
  return link?.title ?? 'Alfred';
}
