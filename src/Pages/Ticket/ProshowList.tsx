import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridToolbar,
  GridValueGetterParams,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useProshows } from '../../Hooks/Ticket/useProshows';
import { IProshowResponse, IProshowStats } from '../../Hooks/Ticket/ticketTypes';
import UserContext from 'Contexts/User/UserContext';
import { ticketAdminRoles } from 'Hooks/Ticket/ticketRoles';
import { DateTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import {
  proshowValidationSchema,
  IValidateCreateProshow,
  defaultDummyProshow,
} from 'Hooks/Ticket/create-update/proshowValidation';
import { ValidationError } from 'yup';
import { debounce } from 'lodash';

// Merged type for the DataGrid row
type IProshowMerged = IProshowResponse & Partial<Omit<IProshowStats, 'id' | 'proshow_title'>>;

function getRowId(row: IProshowMerged) {
  return row.id;
}

interface CustomTextFieldProps {
  fieldName: keyof IValidateCreateProshow;
  label: string;
  newProshow: IValidateCreateProshow;
  setNewProshow: React.Dispatch<React.SetStateAction<IValidateCreateProshow>>;
  validationErrors: ValidationError[];
}

function CustomTextField({
  fieldName,
  label,
  newProshow,
  setNewProshow,
  validationErrors,
  ...props
}: CustomTextFieldProps) {
  return (
    <TextField
      autoFocus={fieldName === 'title'}
      margin="dense"
      label={label}
      fullWidth
      value={newProshow[fieldName]}
      onChange={(e) => setNewProshow({ ...newProshow, [fieldName]: e.target.value })}
      error={validationErrors.some((err) => err.path === fieldName)}
      helperText={validationErrors.find((err) => err.path === fieldName)?.message}
      {...props}
    />
  );
}

export default function ProshowList() {
  const { userData, userLoading } = useContext(UserContext);
  const {
    proshows,
    stats,
    fetchStats,
    fetchProshows,
    loading,
    error,
    setError,
    createProshow,
    distributeTickets,
    creating,
    distributing,
  } = useProshows();

  const [createOpen, setCreateOpen] = useState(false);
  const [distributeOpen, setDistributeOpen] = useState(false);
  const [selectedProshowId, setSelectedProshowId] = useState<string | null>(null);
  const [selectedProshowTitle, setSelectedProshowTitle] = useState<string | null>(null);

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

  // Validation and Form State
  const [newProshow, setNewProshow] = useState<IValidateCreateProshow>(defaultDummyProshow);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'title', headerName: 'Title', width: 180 },
      { field: 'location', headerName: 'Location', width: 150 },
      {
        field: 'show_time',
        headerName: 'Show Time',
        width: 180,
        valueGetter: (params: GridValueGetterParams<IProshowMerged>) =>
          new Date(params.row.show_time).toLocaleString(),
      },
      // Stats Columns
      { field: 'total', headerName: 'Total', width: 90, type: 'number' },
      { field: 'created', headerName: 'Created', width: 90, type: 'number' },
      { field: 'emailed', headerName: 'Emailed', width: 90, type: 'number' },
      { field: 'email_failed', headerName: 'Failed', width: 90, type: 'number' },
      { field: 'scanned', headerName: 'Scanned', width: 90, type: 'number' },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 150,
        renderCell: (params: GridRenderCellParams<IProshowMerged>) => (
          <Button
            size="small"
            variant="contained"
            onClick={() => {
              setSelectedProshowId(params.row.id);
              setSelectedProshowTitle(params.row.title);
              setDistributeOpen(true);
            }}
          >
            Distribute
          </Button>
        ),
      },
    ],
    [],
  );

  useEffect(() => {
    fetchStats();
    fetchProshows();
  }, [fetchStats, fetchProshows]);

  useEffect(() => {
    if (loading || userLoading) return;

    if (!userData.roles.some((role) => ticketAdminRoles.includes(role))) {
      setError('You do not have permission to view this page');
    }
  }, [loading, userData, userLoading, setError]);

  // Validation Logic
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
    if (createOpen) {
      const debouncedValidate = debounce(validateProshow, 300);
      debouncedValidate();
      return () => debouncedValidate.cancel();
    }
  }, [newProshow, createOpen, validateProshow]);

  const handleCreateSubmit = async () => {
    const isValid = await validateProshow();
    if (!isValid) return;

    const formattedDate = dayjs(newProshow.show_time).format();

    const success = await createProshow({
      title: newProshow.title,
      location: newProshow.location,
      show_time: formattedDate,
    });

    if (success) {
      setCreateOpen(false);
      setNewProshow(defaultDummyProshow);
    }
  };

  const handleDistribute = async () => {
    if (selectedProshowId) {
      await distributeTickets(selectedProshowId);
      setDistributeOpen(false);
    }
  };

  if (error) {
    return (
      <Typography variant="h5" sx={{ p: 4 }}>
        {error}
      </Typography>
    );
  }

  return (
    <>
      <br />
      <Typography variant="h5" noWrap component="div">
        Proshows
      </Typography>
      <br />
      <Button variant="contained" size="small" onClick={() => setCreateOpen(true)}>
        Create Proshow
      </Button>
      <br />
      <br />
      <DataGrid
        density="compact"
        getRowId={getRowId}
        rows={mergedProshows}
        columns={columns}
        loading={loading}
        sx={{
          width: '95%',
        }}
        autoPageSize
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            printOptions: {
              hideFooter: true,
              hideHeader: true,
              hideToolbar: true,
            },
          },
        }}
      />

      {/* Create Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Proshow</DialogTitle>
        <DialogContent dividers>
          <CustomTextField
            fieldName="title"
            label="Title"
            newProshow={newProshow}
            setNewProshow={setNewProshow}
            validationErrors={validationErrors}
          />
          <CustomTextField
            fieldName="location"
            label="Location"
            newProshow={newProshow}
            setNewProshow={setNewProshow}
            validationErrors={validationErrors}
          />

          <DateTimePicker
            label="Show Time"
            value={dayjs(newProshow.show_time)}
            sx={{ width: '100%', marginTop: 2 }}
            onChange={(e) => {
              setNewProshow((prev) => ({
                ...prev,
                show_time: e ? e.toDate() : new Date(),
              }));
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateSubmit}
            disabled={creating}
            variant="contained"
            color="primary"
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Distribute Dialog */}
      <Dialog open={distributeOpen} onClose={() => setDistributeOpen(false)}>
        <DialogTitle>Distribute Tickets</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to distribute tickets for <strong>{selectedProshowTitle}</strong>?
            <br />
            <br />
            This will queue emails for all eligible users.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDistributeOpen(false)}>Cancel</Button>
          <Button onClick={handleDistribute} autoFocus variant="contained" disabled={distributing}>
            Distribute
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
