import { useEffect, useMemo } from 'react';
import { useMarathon } from '../../Hooks/Ticket/useMarathon';
import { IMarathonAttendee } from '../../Hooks/Ticket/ticketTypes';
import { PageHeader } from '@/Components/page-header';
import { PageError } from '@/Components/page-state';
import { DataTable } from '@/Components/data-table/DataTable';
import type { DataColumn } from '@/Components/data-table/types';

function getRowId(row: IMarathonAttendee) {
  return row.ticket_id;
}

const toDate = (value: string | null) => (value ? new Date(value) : null);

export default function MarathonAttendees() {
  const { attendees, loading, error, fetchAll } = useMarathon();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const columns: DataColumn<IMarathonAttendee>[] = useMemo(
    () => [
      { field: 'name', headerName: 'Name', width: 200 },
      { field: 'email', headerName: 'Email', width: 260 },
      { field: 'event_title', headerName: 'Event', width: 200 },
      { field: 'status', headerName: 'Email status', width: 130 },
      {
        field: 'emailed_at',
        headerName: 'Emailed',
        width: 180,
        valueGetter: ({ row }) => toDate(row.emailed_at),
      },
      {
        field: 'bib_collected_at',
        headerName: 'Bib collected',
        width: 180,
        valueGetter: ({ row }) => toDate(row.bib_collected_at),
      },
      {
        field: 'checked_in_at',
        headerName: 'Checked in',
        width: 180,
        valueGetter: ({ row }) => toDate(row.checked_in_at),
      },
    ],
    [],
  );

  if (error) {
    return <PageError>{error}</PageError>;
  }

  return (
    <>
      <PageHeader
        title="Marathon attendees"
        description="Every marathon participant with email, bib collection and check-in status."
      />
      <DataTable
        columns={columns}
        rows={attendees}
        getRowId={getRowId}
        loading={loading}
        exportFileName="marathon-attendees"
        searchPlaceholder="Search attendees..."
      />
    </>
  );
}
