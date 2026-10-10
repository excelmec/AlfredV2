import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/Components/ui/input';
import { Switch } from '@/Components/ui/switch';
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

function BibCell({
  row,
  onSave,
}: {
  row: IMarathonAttendee;
  onSave: (ticketId: string, bib: string) => Promise<string | null>;
}) {
  const [value, setValue] = useState(row.bib_number ?? '');
  const [err, setErr] = useState('');

  useEffect(() => {
    setValue(row.bib_number ?? '');
  }, [row.bib_number]);

  const save = async () => {
    if (value === (row.bib_number ?? '')) return;
    if (value && !/^\d{3}$/.test(value)) {
      setErr('Must be 3 digits');
      toast.error('Bib number must be exactly 3 digits');
      return;
    }
    const message = await onSave(row.ticket_id, value);
    if (message) {
      setErr(message);
      toast.error(message);
      setValue(row.bib_number ?? '');
    } else {
      setErr('');
    }
  };

  return (
    <Input
      value={value}
      inputMode="numeric"
      maxLength={3}
      placeholder="—"
      title={err}
      aria-invalid={!!err}
      onChange={(e) => {
        setErr('');
        setValue(e.target.value.replace(/\D/g, '').slice(0, 3));
      }}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        if (e.key === 'Escape') {
          setValue(row.bib_number ?? '');
          setErr('');
        }
      }}
      className="h-8 w-20 text-center"
    />
  );
}

function ScanStatusCell({
  row,
  field,
  label,
  onChange,
}: {
  row: IMarathonAttendee;
  field: 'bib_collected' | 'checked_in';
  label: string;
  onChange: (
    ticketId: string,
    changes: { bib_collected?: boolean; checked_in?: boolean },
  ) => Promise<string | null>;
}) {
  const [saving, setSaving] = useState(false);
  const at = field === 'bib_collected' ? row.bib_collected_at : row.checked_in_at;

  const toggle = async (checked: boolean) => {
    setSaving(true);
    const message = await onChange(row.ticket_id, { [field]: checked });
    setSaving(false);
    if (message) toast.error(message);
    else toast.success(`${row.name}: ${label} ${checked ? 'marked' : 'cleared'}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        size="sm"
        checked={!!at}
        disabled={saving}
        onCheckedChange={toggle}
        aria-label={`${label} for ${row.name}`}
      />
      <span className="text-xs text-muted-foreground">
        {at ? new Date(at).toLocaleString() : 'No'}
      </span>
    </div>
  );
}

export default function MarathonAttendees() {
  const { attendees, loading, error, fetchAll, updateBib, updateScanStatus } = useMarathon();

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
        width: 260,
        valueGetter: ({ row }) => toDate(row.bib_collected_at),
        renderCell: ({ row }) => (
          <ScanStatusCell
            row={row}
            field="bib_collected"
            label="Bib collection"
            onChange={updateScanStatus}
          />
        ),
      },
      {
        field: 'bib_number',
        headerName: 'Bib no.',
        width: 120,
        renderCell: ({ row }) => <BibCell row={row} onSave={updateBib} />,
      },
      {
        field: 'checked_in_at',
        headerName: 'Checked in',
        width: 260,
        valueGetter: ({ row }) => toDate(row.checked_in_at),
        renderCell: ({ row }) => (
          <ScanStatusCell
            row={row}
            field="checked_in"
            label="Check-in"
            onChange={updateScanStatus}
          />
        ),
      },
    ],
    [updateBib, updateScanStatus],
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
