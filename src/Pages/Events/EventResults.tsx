import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEventDesc } from '../../Hooks/Event/useEventDesc';
import UserContext from 'Contexts/User/UserContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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

  const {
    fetchEventRegList,
    eventRegsIndividual,
    eventRegsTeam,
    individualRegsLoading,
    teamRegsLoading,
  } = useEventRegList();

  const [openDialog, setOpenDialog] = useState(false);
  const [editingResult, setEditingResult] = useState<IResult | null>(null);
  const [formData, setFormData] = useState<IValidateResult>(defaultResult);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleteAllConfirmationOpen, setDeleteAllConfirmationOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [resultToDelete, setResultToDelete] = useState<number | null>(null);
  const [canEdit, setCanEdit] = useState(false);

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

  const handleRegistrationSelect = (_event: any, newValue: IRegistration | ITeam | null) => {
    if (!newValue) return;

    if ('user' in newValue) {
      const reg = newValue as IRegistration;
      const excelIdVal =
        typeof reg.excelId === 'object' && reg.excelId !== null && 'id' in reg.excelId
          ? (reg.excelId as any).id
          : reg.excelId;

      setFormData((prev) => ({
        ...prev,
        excelId: Number(excelIdVal) || 0,
        name: reg.user.name,
        teamId: reg.teamId?.id ?? reg.user.id,
        teamName: reg.user.name,
        teamMembers: reg.user.name,
      }));
    } else {
      const team = newValue as ITeam;
      const firstMemberExcelId = team.registrations[0]?.excelId;
      const excelIdVal =
        typeof firstMemberExcelId === 'object' &&
        firstMemberExcelId !== null &&
        'id' in firstMemberExcelId
          ? (firstMemberExcelId as any).id
          : firstMemberExcelId;

      setFormData((prev) => ({
        ...prev,
        excelId: Number(excelIdVal) || 0,
        name: team.name,
        teamId: team.id,
        teamName: team.name,
        teamMembers: team.registrations.map((r) => r.user.name).join(', '),
      }));
    }
  };

  if (error) {
    return <Typography variant="h5">{error}</Typography>;
  }

  if (loading || !event) {
    return <Typography variant="h5">Loading...</Typography>;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <br />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Typography variant="h5" noWrap>
          Event Results: {event.name}
        </Typography>
      </Box>
      <br />

      <Box
        sx={{
          width: '90%',
          marginBottom: '20px',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
        component={Paper}
        elevation={2}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            padding: '10px 30px',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          component={Paper}
          elevation={2}
          borderRadius={0}
          zIndex={5}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={() => {
              navigate(-1);
            }}
          >
            Back
          </Button>
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            {canEdit && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add Result
              </Button>
            )}
          </Box>
          {canEdit && (
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => {
                setDeleteConfirmationText('');
                setDeleteAllConfirmationOpen(true);
              }}
            >
              Delete All
            </Button>
          )}
        </Box>

        <Box sx={{ padding: 3 }}>
          {crudError && (
            <Typography color="error" variant="body1" sx={{ mb: 2 }}>
              {crudError}
            </Typography>
          )}

          <Grid container spacing={2}>
            {event.results && event.results.length > 0 ? (
              event.results.map((res) => (
                <Grid item xs={12} key={res.id}>
                  <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={1}>
                        <Typography variant="h6">{res.position}</Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="body1">
                          <strong>{res.teamName}</strong>
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2">{res.teamMembers}</Typography>
                      </Grid>
                      <Grid item xs={2}>
                        <Typography variant="caption">
                          ID: {res.excelId} | Team: {res.teamId}
                        </Typography>
                      </Grid>
                      {canEdit && (
                        <Grid item xs={2} sx={{ textAlign: 'right' }}>
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(res)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => {
                              setResultToDelete(res.id);
                              setDeleteConfirmationOpen(true);
                            }}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography align="center">No results declared yet.</Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingResult ? 'Edit Result' : 'Add Result'}</DialogTitle>
          <DialogContent>
            {crudError && (
              <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                {crudError}
              </Typography>
            )}
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Autocomplete
                  options={
                    (event.isTeam ? eventRegsTeam : eventRegsIndividual) as (
                      | ITeam
                      | IRegistration
                    )[]
                  }
                  getOptionLabel={(option) => {
                    if ('user' in option) {
                      const excelIdVal =
                        typeof option.excelId === 'object' &&
                        option.excelId !== null &&
                        'id' in option.excelId
                          ? (option.excelId as any).id
                          : option.excelId;
                      return `${option.user.name} (${excelIdVal})`;
                    } else {
                      // ITeam
                      return `${option.name} (ID: ${option.id})`;
                    }
                  }}
                  onChange={handleRegistrationSelect}
                  loading={event.isTeam ? teamRegsLoading : individualRegsLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={event.isTeam ? 'Select Team' : 'Select Participant'}
                      placeholder="Search..."
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  label="Position"
                  name="position"
                  type="number"
                  fullWidth
                  value={formData.position}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Excel ID"
                  name="excelId"
                  type="number"
                  fullWidth
                  value={formData.excelId}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Team ID"
                  name="teamId"
                  type="number"
                  fullWidth
                  value={formData.teamId}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Name"
                  name="name"
                  fullWidth
                  value={formData.name}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Team Name"
                  name="teamName"
                  fullWidth
                  value={formData.teamName}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Team Members"
                  name="teamMembers"
                  fullWidth
                  value={formData.teamMembers}
                  onChange={handleChange}
                  placeholder="e.g. Peter Griffin, Brian Griffin"
                  helperText="Enter team members separated by commas"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSaveResult} variant="contained" disabled={crudLoading}>
              {crudLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmationOpen} onClose={() => setDeleteConfirmationOpen(false)}>
          <DialogTitle>Delete Result</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this result?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmationOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteResult} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete All Confirmation Dialog */}
        <Dialog
          open={deleteAllConfirmationOpen}
          onClose={() => setDeleteAllConfirmationOpen(false)}
        >
          <DialogTitle>Delete All Results</DialogTitle>
          <DialogContent>
            <Typography color="error" gutterBottom>
              Are you sure you want to delete ALL results for this event? This action cannot be
              undone.
            </Typography>
            <Typography variant="body2" gutterBottom>
              Please type <strong>delete</strong> to confirm.
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Confirmation Text"
              fullWidth
              variant="outlined"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteAllConfirmationOpen(false)}>Cancel</Button>
            <Button
              onClick={handleDeleteAllResults}
              color="error"
              variant="contained"
              disabled={deleteConfirmationText !== 'delete'}
            >
              Delete All
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
