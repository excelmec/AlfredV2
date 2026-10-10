import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/Components/ui/input';
import { Switch } from '@/Components/ui/switch';
import { Button } from '@/Components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import type { SortingState } from '@tanstack/react-table';
import { useMarathon } from '../../Hooks/Ticket/useMarathon';
import { IMarathonAttendee } from '../../Hooks/Ticket/ticketTypes';
import { PageHeader } from '@/Components/page-header';
import { PageError } from '@/Components/page-state';
import { DataTable } from '@/Components/data-table/DataTable';
import type { DataColumn } from '@/Components/data-table/types';

function getRowId(row: IMarathonAttendee) {
  return row.ticket_id;
}

const toDate = (value: string | null) => (value ? new Date(value) : undefined);

// yyyy-mm-dd in local time, matching what <input type="date"> produces
const localDay = (value: string | null) => {
  if (!value) return '';
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

type StatusFilter = 'all' | 'yes' | 'no';

const sortOptions: { value: string; label: string; sort: SortingState }[] = [
  { value: 'default', label: 'Default order', sort: [] },
  { value: 'name-asc', label: 'Name A → Z', sort: [{ id: 'name', desc: false }] },
  { value: 'name-desc', label: 'Name Z → A', sort: [{ id: 'name', desc: true }] },
  { value: 'bib-asc', label: 'Bib no. low → high', sort: [{ id: 'bib_number', desc: false }] },
  { value: 'bib-desc', label: 'Bib no. high → low', sort: [{ id: 'bib_number', desc: true }] },
  {
    value: 'collected-desc',
    label: 'Bib collected: latest first',
    sort: [{ id: 'bib_collected_at', desc: true }],
  },
  {
    value: 'collected-asc',
    label: 'Bib collected: earliest first',
    sort: [{ id: 'bib_collected_at', desc: false }],
  },
  {
    value: 'checkin-desc',
    label: 'Checked in: latest first',
    sort: [{ id: 'checked_in_at', desc: true }],
  },
  {
    value: 'checkin-asc',
    label: 'Checked in: earliest first',
    sort: [{ id: 'checked_in_at', desc: false }],
  },
];

function StatusSelect({
  value,
  onChange,
  yes,
  no,
  label,
}: {
  value: StatusFilter;
  onChange: (v: StatusFilter) => void;
  yes: string;
  no: string;
  label: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as StatusFilter)}>
      <SelectTrigger size="sm" className="w-[170px]" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{label}: all</SelectItem>
        <SelectItem value="yes">{yes}</SelectItem>
        <SelectItem value="no">{no}</SelectItem>
      </SelectContent>
    </Select>
  );
}

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

  const [bibFilter, setBibFilter] = useState<StatusFilter>('all');
  const [collectedFilter, setCollectedFilter] = useState<StatusFilter>('all');
  const [collectedDate, setCollectedDate] = useState('');
  const [checkedInFilter, setCheckedInFilter] = useState<StatusFilter>('all');
  const [checkedInDate, setCheckedInDate] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

  const filtersActive =
    bibFilter !== 'all' ||
    collectedFilter !== 'all' ||
    !!collectedDate ||
    checkedInFilter !== 'all' ||
    !!checkedInDate;

  const resetFilters = () => {
    setBibFilter('all');
    setCollectedFilter('all');
    setCollectedDate('');
    setCheckedInFilter('all');
    setCheckedInDate('');
  };

  const filteredRows = useMemo(
    () =>
      attendees.filter((r) => {
        if (bibFilter === 'yes' && !r.bib_number) return false;
        if (bibFilter === 'no' && r.bib_number) return false;
        if (collectedFilter === 'yes' && !r.bib_collected_at) return false;
        if (collectedFilter === 'no' && r.bib_collected_at) return false;
        if (collectedDate && localDay(r.bib_collected_at) !== collectedDate) return false;
        if (checkedInFilter === 'yes' && !r.checked_in_at) return false;
        if (checkedInFilter === 'no' && r.checked_in_at) return false;
        if (checkedInDate && localDay(r.checked_in_at) !== checkedInDate) return false;
        return true;
      }),
    [attendees, bibFilter, collectedFilter, collectedDate, checkedInFilter, checkedInDate],
  );

  const sortValue =
    sortOptions.find((o) => JSON.stringify(o.sort) === JSON.stringify(sorting))?.value ?? 'custom';

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
        valueGetter: ({ row }) => row.bib_number ?? undefined,
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
        rows={filteredRows}
        sorting={sorting}
        onSortingChange={setSorting}
        toolbar={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <StatusSelect
              label="Bib no."
              value={bibFilter}
              onChange={setBibFilter}
              yes="Bib assigned"
              no="Bib unassigned"
            />
            <StatusSelect
              label="Bib collection"
              value={collectedFilter}
              onChange={setCollectedFilter}
              yes="Bib collected"
              no="Not collected"
            />
            <Input
              type="date"
              value={collectedDate}
              onChange={(e) => setCollectedDate(e.target.value)}
              aria-label="Bib collected on"
              title="Bib collected on"
              className="h-8 w-[150px]"
            />
            <StatusSelect
              label="Check-in"
              value={checkedInFilter}
              onChange={setCheckedInFilter}
              yes="Checked in"
              no="Not checked in"
            />
            <Input
              type="date"
              value={checkedInDate}
              onChange={(e) => setCheckedInDate(e.target.value)}
              aria-label="Checked in on"
              title="Checked in on"
              className="h-8 w-[150px]"
            />
            {filtersActive && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Clear filters
              </Button>
            )}
            <Select
              value={sortValue}
              onValueChange={(v) => setSorting(sortOptions.find((o) => o.value === v)?.sort ?? [])}
            >
              <SelectTrigger size="sm" className="w-[210px]" aria-label="Sort by">
                <SelectValue placeholder="Custom sort" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
        getRowId={getRowId}
        loading={loading}
        exportFileName="marathon-attendees"
        searchPlaceholder="Search attendees..."
      />
    </>
  );
}
