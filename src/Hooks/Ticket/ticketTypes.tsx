export interface ITicketListItem {
    id: number;
    excelId: number;
    name: string;
    email: string;
    isPaid: boolean;
    mailSent: boolean;
    checkedIn: boolean;
    branchCode: string;
    branchDivision: string;
}

export interface ITicket extends ITicketListItem {
    amount: number;
    errorCount: number;
    checkedInBy?: string;
}

