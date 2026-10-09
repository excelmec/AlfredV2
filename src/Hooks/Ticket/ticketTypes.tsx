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

export interface IMarathonEventCreate {
  title: string;
  location: string;
  event_time: string;
}

export interface IMarathonEventResponse {
  id: string;
  title: string;
  location: string;
  event_time: string;
  created_at: string;
}

export interface IMarathonAttendee {
  ticket_id: string;
  name: string;
  email: string;
  event_title: string;
  status: string;
  emailed_at: string | null;
  bib_collected_at: string | null;
  bib_number: string | null;
  checked_in_at: string | null;
}

export interface IMarathonStats {
  event_title: string;
  total: number;
  created: number;
  emailed: number;
  email_failed: number;
  bib_collected: number;
  checked_in: number;
}
