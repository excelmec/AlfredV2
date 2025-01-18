export interface ITicketListItem {
    id: number;
    excelId: number;
    name: string;
    isPaid: boolean;
    amount: number;
    isCheckedIn: boolean;
    branchCode: string;
    branchDivision: string;
}

export interface ITicket extends ITicketListItem {

    entryFee?: number;
    checkedInBy?: ICheckedInBy;
    // Add checkedInBy, checkedInAt
}

export interface ICheckedInBy {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
}

