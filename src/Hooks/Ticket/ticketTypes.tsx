// export interface ITicketListItem {
//   id: number;
//   excelId: number;
//   name: string;
//   email: string;
//   isPaid: boolean;
//   mailSent: boolean;
//   checkedIn: boolean;
//   branchCode: string;
//   branchDivision: string;
// }
//
// export interface ITicket extends ITicketListItem {
//   amount: number;
//   errorCount: number;
//   checkedInBy?: string;
// }

export interface IProshowStatus {
  title: string;
  status: string;
  emailed_at: string | null;
  scanned_at: string | null;
}

export interface ITicketUser {
  name: string;
  email: string;
  proshows: IProshowStatus[];
}

export interface IProshowStats {
  id: string;
  proshow_title: string;
  total: number;
  created: number;
  emailed: number;
  email_failed: number;
  scanned: number;
}

export interface IProshowCreate {
  title: string;
  location: string;
  show_time: string;
}

export interface IProshowResponse {
  id: string;
  title: string;
  location: string;
  show_time: string;
  created_at: string;
}

export interface IDistributeResponse {
  success: boolean;
  message: string;
  total_tickets: number;
  batches: number;
}

export interface IAttendeeUploadResponse {
  total_rows: number;
  successfully_upserted: number;
  rejected_total: number;
  rejected_preview: Array<{
    data: {
      name: string;
      email: string;
    };
    error: string;
  }>;
}
