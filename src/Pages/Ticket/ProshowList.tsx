import { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { ValidationError } from 'yup';
import { PaperPlaneTiltIcon, PlusIcon } from '@phosphor-icons/react';
import { useSendTickets } from 'Hooks/Ticket/useSendTickets';
import { SendTicketsDialog } from './SendTicketsDialog';
import { useProshows } from '../../Hooks/Ticket/useProshows';
import { IProshowResponse, IProshowStats } from '../../Hooks/Ticket/ticketTypes';
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
import { Spinner } from '@/Components/ui/spinner';

// Merged type for the table row
type IProshowMerged = IProshowResponse & Partial<Omit<IProshowStats, 'id' | 'proshow_title'>>;

function getRowId(row: IProshowMerged) {
  return row.id;
}

interface CreateProshowDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: IValidateCreateProshow) => Promise<void>;
  creating: boolean;
}

function CreateProshowDialog({ open, onClose, onSubmit, creating }: CreateProshowDialogProps) {
  const [newProshow, setNewProshow] = useState<IValidateCreateProshow>(defaultDummyProshow);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    if (open) {
      setNewProshow(defaultDummyProshow);
      setValidationErrors([]);
    }
  }, [open]);

  const validateProshow = useCallback(async () => {
    try {
      await proshowValidationSchema.validate(newProshow, { abortEarly: false });
      setValidationErrors([]);
      return true;
    } catch (err) {
      if (err instanceof ValidationError) {
        setValidationErrors(err.inner);
      }
      return false;
    }
  }, [newProshow]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        validateProshow();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [newProshow, open, validateProshow]);

  const handleCreateSubmit = async () => {
    const isValid = await validateProshow();
    if (!isValid) return;
    await onSubmit(newProshow);
  };

  const getError = (field: keyof IValidateCreateProshow) =>
    validationErrors.find((err) => err.path === field)?.message;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create new proshow</DialogTitle>
          <DialogDescription>Add a proshow that attendees can hold tickets for.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <FormField label="Title" htmlFor="proshow-title" error={getError('title')}>
            <Input
              id="proshow-title"
              autoFocus
              value={newProshow.title}
              aria-invalid={!!getError('title')}
              onChange={(e) => setNewProshow((prev) => ({ ...prev, title: e.target.value }))}
            />
          </FormField>
          <FormField label="Location" htmlFor="proshow-location" error={getError('location')}>
            <Input
              id="proshow-location"
              value={newProshow.location}
              aria-invalid={!!getError('location')}
              onChange={(e) => setNewProshow((prev) => ({ ...prev, location: e.target.value }))}
            />
          </FormField>
          <FormField label="Show time" error={getError('show_time')}>
            <DateTimePicker
              value={newProshow.show_time}
              onChange={(value) => setNewProshow((prev) => ({ ...prev, show_time: value }))}
            />
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreateSubmit} disabled={creating}>
            {creating && <Spinner />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ProshowList() {
  const { userData } = useContext(UserContext);
  const { proshows, stats, fetchStats, fetchProshows, loading, error, createProshow, creating } =
    useProshows();

  const [createOpen, setCreateOpen] = useState(false);
  const { sendTickets, sending, sendError, sendResult, resetSend } = useSendTickets('proshow');
  const [sendTarget, setSendTarget] = useState<IProshowMerged | null>(null);
  const isTicketAdmin = userData.roles.some((role) => ticketAdminRoles.includes(role));

  const mergedProshows = useMemo(() => {
    if (proshows.length === 0) return [];

    return proshows.map((proshow) => {
      // Find matching stats by title
      const stat = stats.find((s) => s.proshow_title === proshow.title);
      return {
        ...proshow,
        total: stat?.total ?? 0,
        created: stat?.created ?? 0,
        emailed: stat?.emailed ?? 0,
        email_failed: stat?.email_failed ?? 0,
        scanned: stat?.scanned ?? 0,
      };
    });
  }, [proshows, stats]);

  const columns: DataColumn<IProshowMerged>[] = useMemo(
    () => [
      { field: 'title', headerName: 'Title', width: 180 },
      { field: 'location', headerName: 'Location', width: 150 },
      {
        field: 'show_time',
        headerName: 'Show Time',
        width: 180,
        valueGetter: ({ row }) => new Date(row.show_time),
      },
      // Stats Columns
      { field: 'total', headerName: 'Total', width: 90, type: 'number' },
      { field: 'created', headerName: 'Created', width: 90, type: 'number' },
      { field: 'emailed', headerName: 'Emailed', width: 90, type: 'number' },
      { field: 'email_failed', headerName: 'Failed', width: 90, type: 'number' },
      { field: 'scanned', headerName: 'Scanned', width: 90, type: 'number' },
      ...(isTicketAdmin
        ? [
            {
              field: 'send',
              headerName: 'Send tickets',
              width: 140,
              sortable: false,
              renderCell: ({ row }: { row: IProshowMerged }) => (
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

  useEffect(() => {
    fetchStats();
    fetchProshows();
  }, [fetchStats, fetchProshows]);

  const handleCreateSubmit = async (data: IValidateCreateProshow) => {
    if (!userData.roles.some((role) => ticketAdminRoles.includes(role))) return;

    const formattedDate = dayjs(data.show_time).format();

    const success = await createProshow({
      title: data.title,
      location: data.location,
      show_time: formattedDate,
    });

    if (success) {
      setCreateOpen(false);
    }
  };

  if (error) {
    return <PageError>{error}</PageError>;
  }

  return (
    <>
      <PageHeader
        title="Proshows"
        description="Proshows and how many tickets are created, emailed and scanned."
        actions={
          userData.roles.some((role) => ticketAdminRoles.includes(role)) && (
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon weight="bold" /> Create proshow
            </Button>
          )
        }
      />
      <DataTable
        columns={columns}
        rows={mergedProshows}
        getRowId={getRowId}
        loading={loading}
        exportFileName="proshows"
        searchPlaceholder="Search proshows..."
      />

      <SendTicketsDialog
        title={sendTarget?.title ?? null}
        pending={(sendTarget?.created ?? 0) + (sendTarget?.email_failed ?? 0)}
        sending={sending}
        error={sendError}
        result={sendResult}
        onConfirm={async () => {
          if (sendTarget && (await sendTickets(sendTarget.id))) fetchStats();
        }}
        onClose={() => setSendTarget(null)}
      />

      <CreateProshowDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        creating={creating}
      />
    </>
  );
}
