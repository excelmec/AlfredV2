import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PencilSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { IScheduleItem } from '../../Hooks/Event/eventTypes';
import UserContext from 'Contexts/User/UserContext';
import { allEventEditRoles, allEventViewRoles } from 'Hooks/Event/eventRoles';
import { useScheduleList } from 'Hooks/Event/useScheduleList';
import { ConfirmDialog } from '@/Components/confirm-dialog';
import { DateTimePicker } from '@/Components/datetime-picker';
import { PageHeader } from '@/Components/page-header';
import { PageError } from '@/Components/page-state';
import { DataTable } from '@/Components/data-table/DataTable';
import { RowAction } from '@/Components/data-table/RowAction';
import type { DataColumn } from '@/Components/data-table/types';
import { Button } from '@/Components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';

function getRowId(row: IScheduleItem) {
  return row.id;
}

export default function EventSchedule() {
  const { userData } = useContext(UserContext);

  const {
    eventList,
    fetchEventList,
    updateScheduleItem,
    loading,
    error,
    setError,
    columns,
    deleteScheduleItem,
  } = useScheduleList();

  const [viewableEvents, setViewableEvents] = useState<IScheduleItem[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<IScheduleItem | null>(null);
  const [editRound, setEditRound] = useState('');
  const [editRoundId, setEditRoundId] = useState('');
  const [editDatetime, setEditDatetime] = useState<Date>(new Date());
  const [editDay, setEditDay] = useState<number>(1);
  const [itemToDelete, setItemToDelete] = useState<IScheduleItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  const handleEditClick = (event: IScheduleItem) => {
    setSelectedEvent(event);
    setEditRound(event.round);
    setEditRoundId(event.roundId.toString());
    setEditDatetime(new Date(event.datetime));
    setEditDay(event.day);
    setEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setSelectedEvent(null);
    setEditRound('');
    setEditRoundId('');
    setEditDatetime(new Date());
    setEditDay(1);
  };

  const handleSaveEdit = async () => {
    if (
      selectedEvent?.round === editRound &&
      selectedEvent?.roundId === Number(editRoundId) &&
      selectedEvent?.datetime.getTime() === editDatetime.getTime() &&
      selectedEvent?.day === editDay
    ) {
      handleCloseModal();
      return;
    }
    await updateScheduleItem(selectedEvent, editRound, Number(editRoundId), editDatetime, editDay);
    handleCloseModal();
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      setDeleting(true);
      await deleteScheduleItem(itemToDelete.eventId, itemToDelete.roundId);
    } finally {
      setDeleting(false);
      setItemToDelete(null);
    }
  };

  const tableColumns: DataColumn<IScheduleItem>[] = [
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
          onClick={() => handleEditClick(params.row)}
        />,
        <RowAction
          key="delete"
          icon={<TrashIcon />}
          label="Delete"
          tone="destructive"
          onClick={() => setItemToDelete(params.row)}
        />,
      ],
    },
  ];

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
        title="Event schedule"
        description="Rounds and timings across all festival days."
        actions={
          <Button onClick={() => navigate('/events/schedule/create')}>
            <PlusIcon weight="bold" /> Create schedule
          </Button>
        }
      />
      <DataTable
        columns={tableColumns}
        rows={viewableEvents}
        getRowId={getRowId}
        loading={loading}
        exportFileName="event-schedule"
        searchPlaceholder="Search schedule..."
      />

      <Dialog open={editModalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit schedule item</DialogTitle>
            <DialogDescription>
              Modify the round information for this schedule item.
              {selectedEvent && (
                <span className="mt-1 block font-medium text-foreground">
                  Event: {selectedEvent.name}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-round">Round text</Label>
              <Input
                id="edit-round"
                autoFocus
                value={editRound}
                onChange={(e) => setEditRound(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-round-id">Round ID</Label>
              <Input
                id="edit-round-id"
                value={editRoundId}
                onChange={(e) => setEditRoundId(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Day</Label>
              <Select value={String(editDay)} onValueChange={(v) => setEditDay(Number(v))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3].map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      Day {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Date &amp; time</Label>
              <DateTimePicker value={editDatetime} onChange={setEditDatetime} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={itemToDelete !== null}
        title="Delete schedule item"
        description={`Delete "${itemToDelete?.round}" of ${itemToDelete?.name}?`}
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onCancel={() => setItemToDelete(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
