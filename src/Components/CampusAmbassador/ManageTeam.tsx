import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  FloppyDiskIcon,
  MinusCircleIcon,
  PencilSimpleIcon,
  PlusIcon,
  XIcon,
} from '@phosphor-icons/react';
import { useCaTeam } from 'Hooks/CampusAmbassador/useCaTeam';
import { maxCaTeamSize } from 'Hooks/CampusAmbassador/constants';
import { Combobox } from '@/Components/combobox';
import { ConfirmDialog } from '@/Components/confirm-dialog';
import { DetailCard } from '@/Components/detail-card';
import { PageError, PageLoading } from '@/Components/page-state';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Spinner } from '@/Components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';

export default function ManageTeam() {
  const { teamId } = useParams();

  const [addingAmbassador, setAddingAmbassador] = useState<boolean>(false);
  const [chosenAmbassadorId, setChosenAmbassadorId] = useState<number>(0);

  const [editingTeamName, setEditingTeamName] = useState<boolean>(false);
  const [ambassadorToRemove, setAmbassadorToRemove] = useState<{
    ambassadorId: number;
    name: string;
  } | null>(null);
  const {
    caTeam,
    fetchCaTeam,
    loading,
    error,
    caList,
    addAmbassador,
    savingAmbassador,
    updateTeamName,
    savingTeamName,

    removeAmbassador,
    removingAmbassador,
  } = useCaTeam();

  const [newTeamName, setNewTeamName] = useState<string>(caTeam.name);

  const choosableCaList = caList?.filter((CA) => {
    return !CA.caTeamId;
  });

  useEffect(() => {
    fetchCaTeam(Number(teamId));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamId]);

  useEffect(() => {
    setNewTeamName(caTeam.name);
  }, [caTeam]);

  async function addNewAmbassador() {
    await addAmbassador(Number(teamId), chosenAmbassadorId);
    setChosenAmbassadorId(0);
    setAddingAmbassador(false);
  }

  async function saveTeamName() {
    await updateTeamName(Number(teamId), newTeamName);
    setEditingTeamName(false);
  }

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return <PageError>{error}</PageError>;
  }

  const teamSize = caTeam.ambassadors?.length ?? 0;

  return (
    <div className="grid gap-6">
      <DetailCard
        title="Team details"
        columns={3}
        items={[
          { label: 'Team ID', value: caTeam.id },
          {
            label: 'Name',
            value: editingTeamName ? (
              <div className="flex items-center gap-1">
                <Input
                  autoFocus
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="h-8"
                />
                <Button
                  size="icon-sm"
                  aria-label="Save name"
                  onClick={saveTeamName}
                  disabled={savingTeamName}
                >
                  {savingTeamName ? <Spinner /> : <FloppyDiskIcon />}
                </Button>
                <Button
                  size="icon-sm"
                  variant="outline"
                  aria-label="Cancel"
                  disabled={savingTeamName}
                  onClick={() => {
                    setEditingTeamName(false);
                    setNewTeamName(caTeam.name);
                  }}
                >
                  <XIcon />
                </Button>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1">
                {caTeam.name}
                <Button
                  size="icon-xs"
                  variant="ghost"
                  aria-label="Edit name"
                  onClick={() => setEditingTeamName(true)}
                >
                  <PencilSimpleIcon />
                </Button>
              </span>
            ),
          },
          { label: 'Total bonus points', value: caTeam.totalBonusPoints },
          { label: 'Total referral points', value: caTeam.totalRefPoints },
          {
            label: 'Team capacity',
            value: (
              <Badge variant="secondary">
                {teamSize}/{maxCaTeamSize}
              </Badge>
            ),
          },
        ]}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ambassadors</CardTitle>
          {!addingAmbassador && teamSize < maxCaTeamSize && (
            <Button size="sm" onClick={() => setAddingAmbassador(true)}>
              <PlusIcon weight="bold" /> Add ambassador
            </Button>
          )}
        </CardHeader>
        <CardContent className="grid gap-4">
          {addingAmbassador && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-3">
              <Combobox
                className="min-w-64 flex-1 sm:w-auto"
                options={(choosableCaList ?? []).map((ca) => ({
                  value: String(ca.ambassadorId),
                  label: ca.name,
                  description: ca.email,
                }))}
                value={chosenAmbassadorId ? String(chosenAmbassadorId) : ''}
                onChange={(v) => setChosenAmbassadorId(Number(v))}
                placeholder="Choose an ambassador"
                searchPlaceholder="Search by name or email..."
                disabled={savingAmbassador}
              />
              <Button onClick={addNewAmbassador} disabled={savingAmbassador || !chosenAmbassadorId}>
                {savingAmbassador && <Spinner />}
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => setAddingAmbassador(false)}
                disabled={savingAmbassador}
              >
                Cancel
              </Button>
            </div>
          )}

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ambassador ID</TableHead>
                  <TableHead className="text-right">Bonus pts</TableHead>
                  <TableHead className="text-right">Referral pts</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamSize === 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No ambassadors in this team yet.
                    </TableCell>
                  </TableRow>
                )}
                {caTeam.ambassadors?.map((row) => (
                  <TableRow key={row.email}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.ambassadorId}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.bonusPoints}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.referralPoints}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Remove from team"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() =>
                          setAmbassadorToRemove({
                            ambassadorId: row.ambassadorId,
                            name: row.name,
                          })
                        }
                        disabled={removingAmbassador}
                      >
                        <MinusCircleIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={ambassadorToRemove !== null}
        title="Remove from team"
        description={`Are you sure you want to remove "${ambassadorToRemove?.name}" from the team "${caTeam.name}"?`}
        confirmLabel="Remove"
        destructive
        loading={removingAmbassador}
        onCancel={() => setAmbassadorToRemove(null)}
        onConfirm={async () => {
          if (ambassadorToRemove) {
            await removeAmbassador(Number(teamId), ambassadorToRemove.ambassadorId);
          }
          setAmbassadorToRemove(null);
        }}
      />
    </div>
  );
}
