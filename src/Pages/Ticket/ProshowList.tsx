import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, GridColDef, GridToolbar, GridValueGetterParams } from '@mui/x-data-grid';
import { useContext, useEffect, useState, useCallback, useMemo, memo } from 'react';
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

// Merged type for the DataGrid row
type IProshowMerged = IProshowResponse & Partial<Omit<IProshowStats, 'id' | 'proshow_title'>>;

function getRowId(row: IProshowMerged) {
  return row.id;
}

interface CustomTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  errorText?: string;
  autoFocus?: boolean;
}

const CustomTextField = memo(function CustomTextField({
  label,
  value,
  onChange,
  errorText,
  autoFocus,
}: CustomTextFieldProps) {
  return (
    <TextField
      autoFocus={autoFocus}
      margin="dense"
      label={label}
      fullWidth
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={!!errorText}
      helperText={errorText}
    />
  );
});

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

  // Stable handlers
  const handleTitleChange = useCallback((value: string) => {
    setNewProshow((prev) => ({ ...prev, title: value }));
  }, []);

  const handleLocationChange = useCallback((value: string) => {
    setNewProshow((prev) => ({ ...prev, location: value }));
  }, []);

  const getError = (field: keyof IValidateCreateProshow) =>
    validationErrors.find((err) => err.path === field)?.message;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Proshow</DialogTitle>
      <DialogContent dividers>
        <CustomTextField
          label="Title"
          value={newProshow.title}
          onChange={handleTitleChange}
          errorText={getError('title')}
          autoFocus
        />
        <CustomTextField
          label="Location"
          value={newProshow.location}
          onChange={handleLocationChange}
          errorText={getError('location')}
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
        <Button onClick={onClose}>Cancel</Button>
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
  );
}

export default function ProshowList() {
  const { userData } = useContext(UserContext);
  const { proshows, stats, fetchStats, fetchProshows, loading, error, createProshow, creating } =
    useProshows();

  const [createOpen, setCreateOpen] = useState(false);

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
    ],
    [],
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
      {userData.roles.some((role) => ticketAdminRoles.includes(role)) && (
        <Button variant="contained" size="small" onClick={() => setCreateOpen(true)}>
          Create Proshow
        </Button>
      )}
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

      <CreateProshowDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        creating={creating}
      />
    </>
  );
}
