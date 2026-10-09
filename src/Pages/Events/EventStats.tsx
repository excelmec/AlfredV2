import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon } from '@phosphor-icons/react';
import { TypeSafeColDef } from 'Hooks/gridColumType';
import { IEventWithStats } from 'Hooks/Event/eventStatsTypes';
import { useEventStatistics } from 'Hooks/Event/statistics/useEventStatistics';
import { PageHeader } from '@/Components/page-header';
import { PageError } from '@/Components/page-state';
import { DataTable } from '@/Components/data-table/DataTable';
import { RowAction } from '@/Components/data-table/RowAction';

function getRowId(row: IEventWithStats) {
  return row.id;
}

export default function EventStatsPage() {
  const { eventStatsArray, fetchEventStatistics, loading, error, eventStatsCols } =
    useEventStatistics();

  const navigate = useNavigate();

  const columns: TypeSafeColDef<IEventWithStats>[] = [
    ...eventStatsCols,
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 80,
      getActions: (params) => [
        <RowAction
          key="view"
          icon={<EyeIcon />}
          label="View registrations"
          tone="primary"
          onClick={() => navigate(`/events/registrations/view/${params.row.id}`)}
        />,
      ],
    },
  ];

  useEffect(() => {
    fetchEventStatistics();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return <PageError>{error}</PageError>;
  }

  return (
    <>
      <PageHeader
        title="Registration statistics"
        description="Individual and team registrations for every event."
      />
      <DataTable
        columns={columns}
        rows={eventStatsArray}
        getRowId={getRowId}
        loading={loading}
        exportFileName="event-registration-statistics"
        searchPlaceholder="Search events..."
      />
    </>
  );
}
