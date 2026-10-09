import { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { ValidationError } from 'yup';
import {
  CheckCircleIcon,
  PaperPlaneTiltIcon,
  PlusIcon,
  UploadSimpleIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { useMarathon } from '../../Hooks/Ticket/useMarathon';
import { useSendTickets } from 'Hooks/Ticket/useSendTickets';
import { SendTicketsDialog } from './SendTicketsDialog';
import { IMarathonEventResponse, IMarathonStats } from '../../Hooks/Ticket/ticketTypes';
import UserContext from 'Contexts/User/UserContext';
import { ticketAdminRoles } from 'Hooks/Ticket/ticketRoles';
import {
  proshowValidationSchema,
  IValidateCreateProshow,
  defaultDummyProshow,
} from 'Hooks/Ticket/create-update/proshowValidation';
import { DateTimePicker } from '@/Components/datetime-picker';
import { FormField } from '@/Components/form-layout';
import { PageHeader } from '@/Components/page-header';
import { PageError } from '@/Components/page-state';
import { DataTable } from '@/Components/data-table/DataTable';
import type { DataColumn } from '@/Components/data-table/types';
import { Alert, AlertDescription, AlertTitle } from '@/Components/ui/alert';
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
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Spinner } from '@/Components/ui/spinner';

type IMarathonMerged = IMarathonEventResponse & Partial<Omit<IMarathonStats, 'event_title'>>;

function getRowId(row: IMarathonMerged) {
  return row.id;
}

interface CreateEventDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: IValidateCreateProshow) => Promise<void>;
  creating: boolean;
}

function CreateEventDialog({ open, onClose, onSubmit, creating }: CreateEventDialogProps) {
  const [event, setEvent] = useState<IValidateCreateProshow>(defaultDummyProshow);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    if (open) {
      setEvent(defaultDummyProshow);
      setValidationErrors([]);
    }
  }, [open]);

  const validate = useCallback(async () => {
    try {
      await proshowValidationSchema.validate(event, { abortEarly: false });
      setValidationErrors([]);
      return true;
    } catch (err) {
      if (err instanceof ValidationError) {
        setValidationErrors(err.inner);
      }
      return false;
    }
  }, [event]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(validate, 300);
      return () => clearTimeout(timer);
    }
  }, [event, open, validate]);

  const handleSubmit = async () => {
    if (!(await validate())) return;
    await onSubmit(event);
  };

  const getError = (field: keyof IValidateCreateProshow) =>
    validationErrors.find((err) => err.path === field)?.message;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create marathon event</DialogTitle>
          <DialogDescription>
            Add a marathon that participants can hold tickets for.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <FormField label="Title" htmlFor="marathon-title" error={getError('title')}>
            <Input
              id="marathon-title"
              autoFocus
              value={event.title}
              aria-invalid={!!getError('title')}
              onChange={(e) => setEvent((prev) => ({ ...prev, title: e.target.value }))}
            />
          </FormField>
          <FormField label="Location" htmlFor="marathon-location" error={getError('location')}>
            <Input
              id="marathon-location"
              value={event.location}
              aria-invalid={!!getError('location')}
              onChange={(e) => setEvent((prev) => ({ ...prev, location: e.target.value }))}
            />
          </FormField>
          <FormField label="Flag-off time" error={getError('show_time')}>
            <DateTimePicker
              value={event.show_time}
              onChange={(value) => setEvent((prev) => ({ ...prev, show_time: value }))}
            />
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={creating}>
            {creating && <Spinner />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function MarathonList() {
  const { userData } = useContext(UserContext);
  const {
    events,
    stats,
    loading,
    error,
    creating,
    uploading,
    uploadError,
    uploadResult,
    fetchAll,
    createEvent,
    uploadAttendees,
    clearUploadResult,
  } = useMarathon();

  const [createOpen, setCreateOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const isTicketAdmin = userData.roles.some((role) => ticketAdminRoles.includes(role));
  const { sendTickets, sending, sendError, sendResult, resetSend } = useSendTickets('marathon');
  const [sendTarget, setSendTarget] = useState<IMarathonMerged | null>(null);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const rows = useMemo<IMarathonMerged[]>(
    () =>
      events.map((event) => {
        const stat = stats.find((s) => s.event_title === event.title);
        return {
          ...event,
          total: stat?.total ?? 0,
          created: stat?.created ?? 0,
          emailed: stat?.emailed ?? 0,
          email_failed: stat?.email_failed ?? 0,
          bib_collected: stat?.bib_collected ?? 0,
          checked_in: stat?.checked_in ?? 0,
        };
      }),
    [events, stats],
  );

  const columns: DataColumn<IMarathonMerged>[] = useMemo(
    () => [
      { field: 'title', headerName: 'Title', width: 200 },
      { field: 'location', headerName: 'Location', width: 160 },
      {
        field: 'event_time',
        headerName: 'Flag-off',
        width: 180,
        valueGetter: ({ row }) => new Date(row.event_time),
      },
      { field: 'total', headerName: 'Total', width: 90, type: 'number' },
      { field: 'created', headerName: 'Created', width: 90, type: 'number' },
      { field: 'emailed', headerName: 'Emailed', width: 90, type: 'number' },
      { field: 'email_failed', headerName: 'Failed', width: 90, type: 'number' },
      { field: 'bib_collected', headerName: 'Bib collected', width: 120, type: 'number' },
      { field: 'checked_in', headerName: 'Checked in', width: 110, type: 'number' },
      ...(isTicketAdmin
        ? [
            {
              field: 'send',
              headerName: 'Send tickets',
              width: 140,
              sortable: false,
              renderCell: ({ row }: { row: IMarathonMerged }) => (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    resetSend();
                    setSendTarget(row);
                  }}
                >
                  <PaperPlaneTiltIcon /> Send
                </Button>
              ),
            },
          ]
        : []),
    ],
    [isTicketAdmin, resetSend],
  );

  const handleCreateSubmit = async (data: IValidateCreateProshow) => {
    if (!isTicketAdmin) return;
    const created = await createEvent({
      title: data.title,
      location: data.location,
      event_time: dayjs(data.show_time).format(),
    });
    if (created) setCreateOpen(false);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isTicketAdmin) return;
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadOpen(true);
    event.target.value = '';
    await uploadAttendees(file);
  };

  const handleCloseUpload = () => {
    if (uploading) return;
    setUploadOpen(false);
    clearUploadResult();
  };

  if (error) {
    return <PageError>{error}</PageError>;
  }

  return (
    <>
      <PageHeader
        title="Marathon"
        description="Marathon events and how many tickets are created, emailed, collected and checked in."
        actions={
          isTicketAdmin && (
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <label className="cursor-pointer">
                  <UploadSimpleIcon /> Upload participants
                  <input type="file" hidden accept=".csv" onChange={handleFileChange} />
                </label>
              </Button>
              <Button onClick={() => setCreateOpen(true)}>
                <PlusIcon weight="bold" /> Create event
              </Button>
            </div>
          )
        }
      />
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={getRowId}
        loading={loading}
        exportFileName="marathon"
        searchPlaceholder="Search marathon events..."
      />

      <SendTicketsDialog
        title={sendTarget?.title ?? null}
        pending={(sendTarget?.created ?? 0) + (sendTarget?.email_failed ?? 0)}
        sending={sending}
        error={sendError}
        result={sendResult}
        onConfirm={async () => {
          if (sendTarget && (await sendTickets(sendTarget.id))) fetchAll();
        }}
        onClose={() => setSendTarget(null)}
      />

      <CreateEventDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        creating={creating}
      />

      <Dialog open={uploadOpen} onOpenChange={(open) => !open && handleCloseUpload()}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{uploading ? 'Uploading participants...' : 'Upload result'}</DialogTitle>
            <DialogDescription>
              CSV with <code>name</code> and <code>email</code> columns.
            </DialogDescription>
          </DialogHeader>

          {uploading && (
            <div className="flex items-center justify-center gap-2 p-8 text-muted-foreground">
              <Spinner /> Processing file...
            </div>
          )}

          {!uploading && uploadError && (
            <Alert variant="destructive">
              <WarningCircleIcon />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          {!uploading && uploadResult && (
            <div className="grid gap-4">
              <Alert>
                <CheckCircleIcon />
                <AlertTitle>Upload processed</AlertTitle>
                <AlertDescription>
                  {uploadResult.successfully_upserted} of {uploadResult.total_rows} rows imported,{' '}
                  {uploadResult.rejected_total} rejected.
                </AlertDescription>
              </Alert>
              {uploadResult.rejected_preview.length > 0 && (
                <ScrollArea className="max-h-52 rounded-lg border">
                  <ul className="divide-y">
                    {uploadResult.rejected_preview.map((item, idx) => (
                      <li key={idx} className="p-3 text-sm">
                        <div className="font-medium text-destructive">Row error: {item.error}</div>
                        <div className="font-mono text-xs break-all text-muted-foreground">
                          Data: {JSON.stringify(item.data)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={handleCloseUpload} disabled={uploading}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
