import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { CaTeam, useCaTeamList } from 'Hooks/CampusAmbassador/useCaTeamList';
import { ConfirmDialog } from '@/Components/confirm-dialog';
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
import { Spinner } from '@/Components/ui/spinner';

function getRowId(row: CaTeam) {
  return row.id;
}

export default function CaTeamListPage() {
  const {
    caTeamList,
    fetchCaTeamList,
    loading,
    error,
    columns,
    deleteCaTeam,
    teamDeleting,

    teamCreating,
    createCaTeam,
  } = useCaTeamList();

  const [teamToBeDeleted, setTeamToBeDeleted] = useState<CaTeam | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  const navigate = useNavigate();

  const tableColumns: DataColumn<CaTeam>[] = [
    ...columns,
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 100,
      getActions: (params) => [
        <RowAction
          key="view"
          icon={<EyeIcon />}
          label="View"
          tone="primary"
          onClick={() => navigate(`/ca/team/${params.row.id}/view`)}
        />,
        <RowAction
          key="delete"
          icon={<TrashIcon />}
          label="Delete"
          tone="destructive"
          onClick={() => {
            setTeamToBeDeleted(params.row);
            setDeleteOpen(true);
          }}
        />,
      ],
    },
  ];

  async function handleDelete(teamId: number) {
    await deleteCaTeam(teamId);
    handleDeleteClose();
  }

  const handleDeleteClose = () => {
    if (teamDeleting) {
      return;
    }
    setDeleteOpen(false);
  };

  const handleCreateTeamClose = () => {
    if (teamCreating) {
      return;
    }
    setCreateTeamOpen(false);
  };

  async function handleCreateTeam() {
    await createCaTeam(newTeamName);
    handleCreateTeamClose();
  }

  useEffect(() => {
    fetchCaTeamList();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return <PageError>{error}</PageError>;
  }

  return (
    <>
      <PageHeader
        title="Campus Ambassador Teams"
        description="Teams that ambassadors are grouped into."
        actions={
          <Button onClick={() => setCreateTeamOpen(true)}>
            <PlusIcon weight="bold" /> Create team
          </Button>
        }
      />
      <DataTable
        columns={tableColumns}
        rows={caTeamList}
        getRowId={getRowId}
        loading={loading}
        exportFileName="ca-teams"
        searchPlaceholder="Search teams..."
      />

      <ConfirmDialog
        open={deleteOpen}
        title={`Delete team #${teamToBeDeleted?.id ?? ''}`}
        description={`Would you like to delete team: ${teamToBeDeleted?.name ?? ''}?`}
        confirmLabel="Delete"
        destructive
        loading={teamDeleting}
        onConfirm={() => handleDelete(teamToBeDeleted?.id as number)}
        onCancel={handleDeleteClose}
      />

      <Dialog open={createTeamOpen} onOpenChange={(open) => !open && handleCreateTeamClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new team</DialogTitle>
            <DialogDescription>Give the team a name. You can add members later.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="new-team-name">Team name</Label>
            <Input
              id="new-team-name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Enter new team name"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCreateTeamClose} disabled={teamCreating}>
              Cancel
            </Button>
            <Button onClick={handleCreateTeam} disabled={teamCreating || !newTeamName.trim()}>
              {teamCreating && <Spinner />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
