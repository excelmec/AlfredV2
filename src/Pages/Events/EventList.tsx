import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, PencilSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { useEventList } from '../../Hooks/Event/useEventsList';
import { IEventListItem } from '../../Hooks/Event/eventTypes';
import UserContext from 'Contexts/User/UserContext';
import {
  allEventEditRoles,
  allEventViewRoles,
  specificEventViewRoles,
} from 'Hooks/Event/eventRoles';
import { ConfirmDialog } from '@/Components/confirm-dialog';
import { PageHeader } from '@/Components/page-header';
import { PageError } from '@/Components/page-state';
import { DataTable } from '@/Components/data-table/DataTable';
import { RowAction } from '@/Components/data-table/RowAction';
import type { DataColumn } from '@/Components/data-table/types';
import { Button } from '@/Components/ui/button';

function getRowId(row: IEventListItem) {
  return row.id;
}

export default function EventListPage() {
  const { userData } = useContext(UserContext);

  const {
    eventList,
    fetchEventList,
    loading,
    error,
    setError,
    columns,
    deleteEvent,
    eventIsDeleting,
  } = useEventList();

  const [viewableEvents, setViewableEvents] = useState<IEventListItem[]>([]);

  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [eventToDelete, setEventToDelete] = useState<
    Pick<IEventListItem, 'id' | 'name'> | undefined
  >();

  const tableColumns: DataColumn<IEventListItem>[] = [
    ...columns,
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 120,
      getActions: (params) => [
        <RowAction
          key="view"
          icon={<EyeIcon />}
          label="View"
          tone="primary"
          onClick={() => navigate(`/events/view/${params.row.id}`)}
        />,
        <RowAction
          key="edit"
          icon={<PencilSimpleIcon />}
          label="Edit"
          onClick={() => navigate(`/events/edit/${params.row.id}`)}
        />,
        <RowAction
          key="delete"
          icon={<TrashIcon />}
          label="Delete"
          tone="destructive"
          onClick={() => {
            setEventToDelete({ id: params.row.id, name: params.row.name });
            confirmDelete();
          }}
        />,
      ],
    },
  ];

  function confirmDelete() {
    if (userData.roles.some((role) => allEventEditRoles.includes(role))) {
      setDeleteOpen(true);
    } else {
      toast.error('You do not have permission to perform this action.');
    }
  }

  async function handleDelete(eventId: number, eventName: string) {
    await deleteEvent(eventId, eventName);
    handleDeleteClose();
  }

  const handleDeleteClose = () => {
    if (eventIsDeleting) {
      return;
    }
    setDeleteOpen(false);
  };

  useEffect(() => {
    fetchEventList();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading) return;
    if (eventList?.length === 0) return;

    if (userData.roles.some((role) => allEventEditRoles.includes(role))) {
      // This person has edit access to all events, so can view all
      setViewableEvents(eventList);
    } else if (userData.roles.some((role) => allEventViewRoles.includes(role))) {
      // This person has view access to all events, so can view all
      setViewableEvents(eventList);
    } else if (userData.roles.some((role) => specificEventViewRoles.includes(role))) {
      // This person only has view access to events where they are the event head
      const filteredEvents = eventList.filter((event) => {
        return (
          event.eventHead1?.email === userData.email || event.eventHead2?.email === userData.email
        );
      });
      setViewableEvents(filteredEvents);
      if (filteredEvents.length === 0) {
        setError('You do not have permission to view this page');
      }
    } else {
      // This person has no access to any event
      setViewableEvents([]);
      setError('You do not have permission to view this page');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventList, loading, userData]);

  if (error) {
    return <PageError>{error}</PageError>;
  }

  return (
    <>
      <PageHeader
        title="Events"
        description="All events you have access to."
        actions={
          <Button onClick={() => navigate('/events/create')}>
            <PlusIcon weight="bold" /> Create event
          </Button>
        }
      />
      <DataTable
        columns={tableColumns}
        rows={viewableEvents}
        getRowId={getRowId}
        loading={loading}
        exportFileName="events"
        searchPlaceholder="Search events..."
      />

      <ConfirmDialog
        open={deleteOpen}
        title={`Delete event #${eventToDelete?.id ?? ''}`}
        description={`Would you like to delete event: ${eventToDelete?.name ?? ''}?`}
        confirmLabel="Delete"
        destructive
        loading={eventIsDeleting}
        onConfirm={() => handleDelete(eventToDelete?.id as number, eventToDelete?.name as string)}
        onCancel={handleDeleteClose}
      />
    </>
  );
}
