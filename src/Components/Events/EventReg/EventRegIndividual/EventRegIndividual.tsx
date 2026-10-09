import { useState } from 'react';
import { EyeIcon } from '@phosphor-icons/react';
import { IRegistration } from 'Hooks/Event/registrationTypes';
import { TypeSafeColDef } from 'Hooks/gridColumType';
import { IUser } from 'Hooks/useUserList';
import { DataTable } from '@/Components/data-table/DataTable';
import { RowAction } from '@/Components/data-table/RowAction';
import type { DataColumn } from '@/Components/data-table/types';
import { DetailCard } from '@/Components/detail-card';
import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';

export default function EventRegIndividual({
  individualRegsLoading,
  eventRegsIndividual,
  regIndividualCols,
  checkInIndividual,
  isTeam,
}: {
  individualRegsLoading: boolean;
  eventRegsIndividual: IRegistration[];
  regIndividualCols: TypeSafeColDef<IRegistration>[];
  checkInIndividual: (registration: IRegistration) => Promise<void>;
  isTeam: boolean;
}) {
  const initialColVisibility = {
    'user.category': false,
    ambassadorId: false,
    teamId: isTeam,
    'team.name': isTeam,
  };
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  const columns: DataColumn<IRegistration>[] = [
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 70,
      getActions: (params) => [
        <RowAction
          key="view"
          icon={<EyeIcon />}
          label="View user"
          tone="primary"
          onClick={() => {
            setSelectedUser(params.row?.user);
            setUserDetailsOpen(true);
          }}
        />,
      ],
    },
    {
      field: 'checkedIn',
      headerName: 'Checked In',
      type: 'string',
      width: 95,
      align: 'center',
      sortable: false,
      renderCell: ({ row }) => <CheckInCell row={row} checkIn={checkInIndividual} />,
    },
    ...regIndividualCols,
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={eventRegsIndividual}
        getRowId={getRowId}
        loading={individualRegsLoading}
        initialColumnVisibility={initialColVisibility}
        exportFileName="event-registrations"
        searchPlaceholder="Search registrations..."
      />

      <Dialog open={userDetailsOpen} onOpenChange={setUserDetailsOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>User details</DialogTitle>
            <DialogDescription>Contact details of the registered user.</DialogDescription>
          </DialogHeader>
          <UserDetails user={selectedUser} />
          <DialogFooter>
            <Button onClick={() => setUserDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CheckInCell({
  row,
  checkIn,
}: {
  row: IRegistration;
  checkIn: (registration: IRegistration) => Promise<void>;
}) {
  const [checked, setChecked] = useState(!!row.checkedIn);
  return (
    <Checkbox
      aria-label="Check in"
      checked={checked}
      onCheckedChange={(value) => {
        const next = value === true;
        setChecked(next);
        row.checkedIn = next;
        checkIn(row);
      }}
    />
  );
}

function getRowId(row: IRegistration) {
  return row.excelId?.toString();
}

function UserDetails({ user }: { user: IUser | null }) {
  if (!user) {
    return <p className="text-sm text-muted-foreground">No user selected</p>;
  }

  return (
    <DetailCard
      items={[
        { label: 'User ID', value: user.id },
        { label: 'Name', value: user.name },
        { label: 'Email', value: user.email },
        { label: 'Mobile', value: user.mobileNumber },
        { label: 'Institution', value: user.institution },
      ]}
      className="border-0 bg-transparent p-0 shadow-none ring-0"
    />
  );
}
