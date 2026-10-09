import { useState } from 'react';
import { EyeIcon } from '@phosphor-icons/react';
import { ITeam } from 'Hooks/Event/registrationTypes';
import { TypeSafeColDef } from 'Hooks/gridColumType';
import { DataTable } from '@/Components/data-table/DataTable';
import { RowAction } from '@/Components/data-table/RowAction';
import type { DataColumn } from '@/Components/data-table/types';
import { DetailCard } from '@/Components/detail-card';
import { Button } from '@/Components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import { ScrollArea } from '@/Components/ui/scroll-area';

export default function EventRegTeams({
  institutionMap,

  teamCols,
  eventRegsTeam,
  teamRegsLoading,
}: {
  institutionMap: Map<number, string>;
  teamCols: TypeSafeColDef<ITeam>[];
  eventRegsTeam: ITeam[];
  teamRegsLoading: boolean;
}) {
  const [teamDetailsOpen, setTeamDetailsOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<ITeam | null>(null);

  const columns: DataColumn<ITeam>[] = [
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 70,
      getActions: (params) => [
        <RowAction
          key="view"
          icon={<EyeIcon />}
          label="View team"
          tone="primary"
          onClick={() => {
            setSelectedTeam(params.row);
            setTeamDetailsOpen(true);
          }}
        />,
      ],
    },
    ...teamCols,
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={eventRegsTeam}
        getRowId={getRowId}
        loading={teamRegsLoading}
        initialColumnVisibility={{ ambassadorId: false }}
        exportFileName="event-teams"
        searchPlaceholder="Search teams..."
      />

      <Dialog open={teamDetailsOpen} onOpenChange={setTeamDetailsOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Team details</DialogTitle>
            <DialogDescription>Members and contact details of the team.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-3">
            <TeamDetails team={selectedTeam} institutionMap={institutionMap} />
          </ScrollArea>
          <DialogFooter>
            <Button onClick={() => setTeamDetailsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function getRowId(row: ITeam) {
  return row.id?.toString();
}

function TeamDetails({
  team,
  institutionMap,
}: {
  team: ITeam | null;
  institutionMap: Map<number, string>;
}) {
  if (!team) {
    return <p className="text-sm text-muted-foreground">No team selected</p>;
  }

  return (
    <div className="grid gap-4">
      <DetailCard
        items={[
          { label: 'Team name', value: team.name },
          { label: 'Ambassador ID', value: team.ambassadorId?.toString() },
          { label: 'Member count', value: team.registrations.length.toString() },
        ]}
        columns={3}
      />
      {team.registrations.map((reg, index) => (
        <DetailCard
          key={reg.excelId.toString()}
          title={`Member ${index + 1}`}
          items={[
            { label: 'Name', value: reg.user?.name },
            { label: 'Email', value: reg.user?.email },
            { label: 'Mobile', value: reg.user?.mobileNumber },
            {
              label: 'Institution',
              value: institutionMap.get(reg.user?.institutionId ?? 0),
            },
          ]}
        />
      ))}
    </div>
  );
}
