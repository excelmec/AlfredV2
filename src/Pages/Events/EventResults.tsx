import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PencilSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';
import { useEventDesc } from '../../Hooks/Event/useEventDesc';
import UserContext from 'Contexts/User/UserContext';
import {
  allEventEditRoles,
  allEventViewRoles,
  specificEventViewRoles,
} from 'Hooks/Event/eventRoles';
import { useEventResultsCrud } from 'Hooks/Event/results/useEventResultsCrud';
import { defaultResult, IValidateResult } from 'Hooks/Event/results/resultValidation';
import { IResult } from 'Hooks/Event/eventTypes';
import { useEventRegList } from 'Hooks/Event/registrations/useEventReg';
import { IRegistration, ITeam } from 'Hooks/Event/registrationTypes';
import { Combobox } from '@/Components/combobox';
import { ConfirmDialog } from '@/Components/confirm-dialog';
import { PageHeader } from '@/Components/page-header';
import { PageError, PageLoading } from '@/Components/page-state';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
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
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Spinner } from '@/Components/ui/spinner';

function excelIdOf(reg: IRegistration): number {
  const raw: any = reg.excelId;
  return Number(typeof raw === 'object' && raw !== null && 'id' in raw ? raw.id : raw) || 0;
}

export default function EventResults() {
  const { event, fetchEvent, loading, error, setError } = useEventDesc();
  const { userData } = useContext(UserContext);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    addResult,
    updateResult,
    deleteResult,
    deleteAllResults,
    loading: crudLoading,
    error: crudError,
    setError: setCrudError,
  } = useEventResultsCrud();

  const { fetchEventRegList, eventRegsIndividual, eventRegsTeam } = useEventRegList();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingResult, setEditingResult] = useState<IResult | null>(null);
  const [formData, setFormData] = useState<IValidateResult>(defaultResult);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteAllConfirmationOpen, setDeleteAllConfirmationOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [resultToDelete, setResultToDelete] = useState<number | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [participantKey, setParticipantKey] = useState('');

  useEffect(() => {
    if (!Number.isInteger(Number(id))) {
      setError('Invalid Event ID');
    } else {
      fetchEvent(Number(id));
      fetchEventRegList(Number(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (loading || !event) return;

    if (userData.roles.some((role) => allEventEditRoles.includes(role))) {
      setCanEdit(true);
    } else if (userData.roles.some((role) => allEventViewRoles.includes(role))) {
    } else if (userData.roles.some((role) => specificEventViewRoles.includes(role))) {
      if (
        event?.eventHead1?.email === userData.email ||
        event?.eventHead2?.email === userData.email
      ) {
        setCanEdit(true);
      } else {
        setError('You do not have permission to view this page');
      }
    } else {
      setError('You do not have permission to view this page');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, loading, userData]);

  const handleOpenDialog = (result?: IResult) => {
    setParticipantKey('');
    if (result) {
      setEditingResult(result);
      setFormData({
        excelId: result.excelId,
        teamId: result.teamId,
        position: result.position,
        name: result.name,
        teamName: result.teamName,
        teamMembers: result.teamMembers,
      });
    } else {
      setEditingResult(null);
      setFormData(defaultResult);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingResult(null);
    setFormData(defaultResult);
    setCrudError('');
  };

  const handleSaveResult = async () => {
    if (!event) return;
    let success = false;
    if (editingResult) {
      success = await updateResult(editingResult.id, event.id, formData);
    } else {
      success = await addResult(event.id, formData);
    }

    if (success) {
      handleCloseDialog();
      fetchEvent(event.id);
    }
  };

  const handleDeleteResult = async () => {
    if (resultToDelete) {
      const success = await deleteResult(resultToDelete);
      if (success) {
        setDeleteConfirmationOpen(false);
        setResultToDelete(null);
        if (event) fetchEvent(event.id);
      }
    }
  };

  const handleDeleteAllResults = async () => {
    if (event) {
      const success = await deleteAllResults(event.id);
      if (success) {
        setDeleteAllConfirmationOpen(false);
        setDeleteConfirmationText('');
        fetchEvent(event.id);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        value === ''
          ? ''
          : name === 'excelId' || name === 'teamId' || name === 'position'
            ? Number(value)
            : value,
    }));
  };

  const participantOptions = event?.isTeam
    ? eventRegsTeam.map((team) => ({
        value: String(team.id),
        label: team.name,
        description: `Team ID: ${team.id}`,
      }))
    : eventRegsIndividual.map((reg) => ({
        value: String(excelIdOf(reg)),
        label: reg.user?.name ?? String(excelIdOf(reg)),
        description: `Excel ID: ${excelIdOf(reg)}`,
      }));

  const handleRegistrationSelect = (key: string) => {
    setParticipantKey(key);

    if (event?.isTeam) {
      const team = eventRegsTeam.find((t: ITeam) => String(t.id) === key);
      if (!team) return;
      setFormData((prev) => ({
        ...prev,
        excelId: excelIdOf(team.registrations[0]),
        name: team.name,
        teamId: team.id,
        teamName: team.name,
        teamMembers: team.registrations.map((r) => r.user.name).join(', '),
      }));
    } else {
      const reg = eventRegsIndividual.find((r) => String(excelIdOf(r)) === key);
      if (!reg) return;
      setFormData((prev) => ({
        ...prev,
        excelId: excelIdOf(reg),
        name: reg.user.name,
        teamId: reg.teamId?.id ?? reg.user.id,
        teamName: reg.user.name,
        teamMembers: reg.user.name,
      }));
    }
  };

  if (error) {
    return <PageError>{error}</PageError>;
  }

  if (loading || !event) {
    return <PageLoading />;
  }

  return (
    <>
      <PageHeader
        title={`Results: ${event.name}`}
        description="Declare and manage the winners of this event."
        actions={
          <>
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeftIcon /> Back
            </Button>
            {canEdit && (
              <>
                <Button onClick={() => handleOpenDialog()}>
                  <PlusIcon weight="bold" /> Add result
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDeleteConfirmationText('');
                    setDeleteAllConfirmationOpen(true);
                  }}
                >
                  <TrashIcon /> Delete all
                </Button>
              </>
            )}
          </>
        }
      />

      {crudError && !openDialog && (
        <p className="text-sm font-medium text-destructive">{crudError}</p>
      )}

      <div className="grid gap-3">
        {event.results && event.results.length > 0 ? (
          event.results.map((res) => (
            <Card key={res.id} className="py-0">
              <CardContent className="flex flex-wrap items-center gap-4 p-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary tabular-nums">
                  {res.position}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{res.teamName}</div>
                  <div className="truncate text-sm text-muted-foreground">{res.teamMembers}</div>
                </div>
                <Badge variant="secondary">
                  ID {res.excelId} · Team {res.teamId}
                </Badge>
                {canEdit && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Edit result"
                      className="text-primary hover:bg-primary/10 hover:text-primary"
                      onClick={() => handleOpenDialog(res)}
                    >
                      <PencilSimpleIcon />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Delete result"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        setResultToDelete(res.id);
                        setDeleteConfirmationOpen(true);
                      }}
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No results declared yet.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={openDialog} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingResult ? 'Edit result' : 'Add result'}</DialogTitle>
            <DialogDescription>
              Pick a {event.isTeam ? 'team' : 'participant'} to prefill the fields, or enter them
              manually.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-3">
            <div className="grid gap-4 p-0.5">
              {crudError && <p className="text-sm font-medium text-destructive">{crudError}</p>}
              <div className="grid gap-1.5">
                <Label>{event.isTeam ? 'Select team' : 'Select participant'}</Label>
                <Combobox
                  options={participantOptions}
                  value={participantKey}
                  onChange={handleRegistrationSelect}
                  placeholder="Search..."
                  searchPlaceholder="Search..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="res-position">Position</Label>
                  <Input
                    id="res-position"
                    name="position"
                    type="number"
                    value={formData.position}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="res-excel-id">Excel ID</Label>
                  <Input
                    id="res-excel-id"
                    name="excelId"
                    type="number"
                    value={formData.excelId}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="res-team-id">Team ID</Label>
                  <Input
                    id="res-team-id"
                    name="teamId"
                    type="number"
                    value={formData.teamId ?? ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="res-name">Name</Label>
                  <Input id="res-name" name="name" value={formData.name} onChange={handleChange} />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="res-team-name">Team name</Label>
                <Input
                  id="res-team-name"
                  name="teamName"
                  value={formData.teamName ?? ''}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="res-team-members">Team members</Label>
                <Input
                  id="res-team-members"
                  name="teamMembers"
                  value={formData.teamMembers ?? ''}
                  onChange={handleChange}
                  placeholder="e.g. Peter Griffin, Brian Griffin"
                />
                <p className="text-xs text-muted-foreground">
                  Enter team members separated by commas
                </p>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveResult} disabled={crudLoading}>
              {crudLoading && <Spinner />}
              {crudLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmationOpen}
        title="Delete result"
        description="Are you sure you want to delete this result?"
        confirmLabel="Delete"
        destructive
        loading={crudLoading}
        onCancel={() => setDeleteConfirmationOpen(false)}
        onConfirm={handleDeleteResult}
      />

      <Dialog
        open={deleteAllConfirmationOpen}
        onOpenChange={(open) => !open && setDeleteAllConfirmationOpen(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete all results</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete ALL results for this event? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label htmlFor="delete-confirm">
              Type <strong>delete</strong> to confirm
            </Label>
            <Input
              id="delete-confirm"
              autoFocus
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteAllConfirmationOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAllResults}
              disabled={deleteConfirmationText !== 'delete' || crudLoading}
            >
              {crudLoading && <Spinner />}
              Delete all
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
