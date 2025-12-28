import { UserRoles } from 'Contexts/User/UserContext';

export const ticketAdminRoles: UserRoles[] = ['TicketAdmin'];

export const ticketScanRoles: UserRoles[] = [...ticketAdminRoles];
