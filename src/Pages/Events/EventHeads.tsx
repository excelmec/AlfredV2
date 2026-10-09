import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PencilSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';
import ProtectedRoute from '../../Components/Protected/ProtectedRoute';
import { useEventHeadsList } from 'Hooks/Event/eventHeads/useEventHeadsList';
import { IEventHead } from 'Hooks/Event/eventTypes';
import EventHeadCreateModal from 'Components/Events/EventHeads/EventHeadCreate';
import EventHeadEditModal from 'Components/Events/EventHeads/EventHeadEdit';
import { useEventHeadCrud } from 'Hooks/Event/eventHeads/useEventHeadCrud';
import { ConfirmDialog } from '@/Components/confirm-dialog';
import { PageHeader } from '@/Components/page-header';
import { PageError } from '@/Components/page-state';
import { DataTable } from '@/Components/data-table/DataTable';
import { RowAction } from '@/Components/data-table/RowAction';
import type { DataColumn } from '@/Components/data-table/types';
import { Button } from '@/Components/ui/button';

export default function EventHeadsPage() {
  return (
    <ProtectedRoute>
      <EventHeads />
    </ProtectedRoute>
  );
}

function getRowId(row: IEventHead) {
  return row.id;
}

export function EventHeads() {
  const location = useLocation();
  const navigate = useNavigate();
  const { eventHeadsList, fetchEventHeadsList, error, loading, columns } = useEventHeadsList();

  const { deleteEventHead } = useEventHeadCrud();

  const [createHeadModalOpen, setCreateHeadModalOpen] = useState<boolean>(false);

  const [editHeadModalOpen, setEditHeadModalOpen] = useState<boolean>(false);
  const [editHeadId, setEditHeadId] = useState<number>(0);

  const [headToDelete, setHeadToDelete] = useState<IEventHead | null>(null);

  const tableColumns: DataColumn<IEventHead>[] = [
    ...columns,
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 100,
      getActions: (params) => [
        <RowAction
          key="edit"
          icon={<PencilSimpleIcon />}
          label="Edit"
          tone="primary"
          onClick={() => {
            setEditHeadId(params.row.id);
            setEditHeadModalOpen(true);
          }}
        />,
        <RowAction
          key="delete"
          icon={<TrashIcon />}
          label="Delete"
          tone="destructive"
          onClick={() => setHeadToDelete(params.row)}
        />,
      ],
    },
  ];

  async function handleDelete() {
    if (!headToDelete) return;
    const success = await deleteEventHead(headToDelete.id, headToDelete.name);
    setHeadToDelete(null);
    if (success) {
      fetchEventHeadsList();
      toast.success('Event head deleted successfully');
    }
  }

  useEffect(() => {
    fetchEventHeadsList();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (location?.pathname.endsWith('create')) {
      setCreateHeadModalOpen(true);
      navigate('/events/heads');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  if (error) {
    return <PageError>{error}</PageError>;
  }

  return (
    <>
      <PageHeader
        title="Event heads"
        description="People who manage registrations for events."
        actions={
          <Button onClick={() => setCreateHeadModalOpen(true)}>
            <PlusIcon weight="bold" /> Create event head
          </Button>
        }
      />
      <DataTable
        columns={tableColumns}
        rows={eventHeadsList}
        getRowId={getRowId}
        loading={loading}
        exportFileName="event-heads"
        searchPlaceholder="Search event heads..."
      />

      <EventHeadCreateModal
        open={createHeadModalOpen}
        setOpen={setCreateHeadModalOpen}
        refreshList={fetchEventHeadsList}
      />

      {editHeadModalOpen && (
        <EventHeadEditModal
          open={editHeadModalOpen}
          setOpen={setEditHeadModalOpen}
          refreshList={fetchEventHeadsList}
          eventHeadId={editHeadId}
        />
      )}

      <ConfirmDialog
        open={headToDelete !== null}
        title="Delete event head"
        description={`Are you sure you want to delete ${headToDelete?.name ?? 'this event head'}?`}
        confirmLabel="Delete"
        destructive
        onCancel={() => setHeadToDelete(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
