import {
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  Box,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  Grid,
} from '@mui/material';
import { useContext, useEffect, useState, useMemo } from 'react';
import UserContext from 'Contexts/User/UserContext';
import { ticketAdminRoles } from 'Hooks/Ticket/ticketRoles';
import { useTickets } from '../../Hooks/Ticket/useTickets';
import { ITicketUser } from '../../Hooks/Ticket/ticketTypes';
import { useAttendees } from '../../Hooks/Ticket/useAttendees';
import { useProshows } from '../../Hooks/Ticket/useProshows';

import SearchIcon from '@mui/icons-material/Search';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { debounce } from 'lodash';

function getRowId(row: ITicketUser) {
  return row.email;
}

export default function TicketUserList() {
  const { userData, userLoading } = useContext(UserContext);

  const { ticketList, loading, error, setError, fetchTicketList, rowCount, invalidateRowCount } =
    useTickets();
  const {
    uploadAttendees,
    uploading,
    error: uploadError,
    uploadResult,
    clearResult,
  } = useAttendees();
  const { proshows, fetchProshows } = useProshows();

  const [viewableTickets, setViewableTickets] = useState<ITicketUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 50,
  });

  // Upload State
  const [uploadOpen, setUploadOpen] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadOpen(true);

    event.target.value = '';

    const result = await uploadAttendees(file);
    if (result) {
      invalidateRowCount();
      fetchTicketList(
        paginationModel.page * paginationModel.pageSize,
        paginationModel.pageSize,
        searchTerm,
      );
    }
  };

  const handleCloseUpload = () => {
    if (uploading) return;
    setUploadOpen(false);
    clearResult();
  };

  useEffect(() => {
    fetchProshows();
  }, [fetchProshows]);

  const dynamicColumns = useMemo(() => {
    const baseColumns: GridColDef[] = [
      {
        field: 'name',
        headerName: 'Name',
        type: 'string',
        width: 200,
      },
      {
        field: 'email',
        headerName: 'Email',
        type: 'string',
        width: 250,
      },
    ];

    const proshowCols: GridColDef[] = proshows.map((proshow) => ({
      field: `proshow_${proshow.title}`,
      headerName: proshow.title,
      width: 450,
      renderCell: (params: GridRenderCellParams<ITicketUser>) => {
        const userProshow = params.row.proshows?.find((p) => p.title === proshow.title);
        if (!userProshow) return <Typography variant="caption">-</Typography>;

        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              flexWrap: 'wrap',
              py: 1,
            }}
          >
            <Chip
              label={userProshow.status}
              color={
                userProshow.status === 'SCANNED'
                  ? 'success'
                  : userProshow.status === 'EMAILED'
                    ? 'primary'
                    : 'default'
              }
              size="small"
            />
            <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
              <strong>Emailed:</strong>{' '}
              {userProshow.emailed_at ? new Date(userProshow.emailed_at).toLocaleString() : '-'}
            </Typography>
            <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
              <strong>Scanned:</strong>{' '}
              {userProshow.scanned_at ? new Date(userProshow.scanned_at).toLocaleString() : '-'}
            </Typography>
          </Box>
        );
      },
    }));

    return [...baseColumns, ...proshowCols];
  }, [proshows]);

  // Debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce((search: string, page: number, pageSize: number) => {
        fetchTicketList(page * pageSize, pageSize, search);
      }, 500),
    [fetchTicketList],
  );

  // Trigger fetch when searchTerm or pagination changes
  useEffect(() => {
    debouncedSearch(searchTerm, paginationModel.page, paginationModel.pageSize);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, paginationModel, debouncedSearch]);

  useEffect(() => {
    if (loading || userLoading) return;

    if (userData.roles.some((role) => ticketAdminRoles.includes(role))) {
      setViewableTickets(ticketList);
    } else {
      setViewableTickets([]);
      setError('You do not have permission to view this page');
    }
  }, [ticketList, loading, userData, userLoading, setError]);

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
      <Grid container alignItems="center" spacing={2} sx={{ width: '90%', mb: 2, pt: 2 }}>
        <Grid item xs={12} md={4}>
          <Typography variant="h5" noWrap component="div">
            Ticket User List
          </Typography>
        </Grid>
        <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
            Upload Attendees
            <input type="file" hidden accept=".csv" onChange={handleFileChange} />
          </Button>
        </Grid>
        <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <TextField
            size="small"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPaginationModel((prev) => ({ ...prev, page: 0 })); // Reset to page 0 on search
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
        </Grid>
      </Grid>

      <DataGrid
        getRowId={getRowId}
        rows={viewableTickets}
        columns={dynamicColumns}
        loading={loading}
        sx={{
          width: '90%',
        }}
        getRowHeight={() => 'auto'}
        paginationMode="server"
        rowCount={rowCount}
        pageSizeOptions={[20]}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        showCellVerticalBorder
        showColumnVerticalBorder
      />

      <Dialog open={uploadOpen} onClose={handleCloseUpload} maxWidth="md" fullWidth>
        <DialogTitle>{uploading ? 'Uploading Attendees...' : 'Upload Result'}</DialogTitle>
        <DialogContent dividers>
          {uploading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Typography>Processing file, please wait...</Typography>
            </Box>
          )}

          {!uploading && !uploadResult && !uploadError && (
            <Typography sx={{ p: 2 }}>Select a file to start uploading.</Typography>
          )}

          {!uploading && uploadError && (
            <Alert severity="error" sx={{ width: '100%', m: 2 }}>
              {uploadError}
            </Alert>
          )}

          {!uploading && uploadResult && (
            <Box sx={{ p: 2 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                <AlertTitle>Upload Processed</AlertTitle>
                Processed {uploadResult.total_rows} rows.
              </Alert>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={4}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6">{uploadResult.total_rows}</Typography>
                    <Typography variant="caption">Total Rows</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                    <Typography variant="h6" color="success.main">
                      {uploadResult.successfully_upserted}
                    </Typography>
                    <Typography variant="caption">Success</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      bgcolor: uploadResult.rejected_total > 0 ? '#ffebee' : 'inherit',
                    }}
                  >
                    <Typography
                      variant="h6"
                      color={uploadResult.rejected_total > 0 ? 'error.main' : 'inherit'}
                    >
                      {uploadResult.rejected_total}
                    </Typography>
                    <Typography variant="caption">Rejected</Typography>
                  </Paper>
                </Grid>
              </Grid>

              {uploadResult.rejected_preview.length > 0 && (
                <>
                  <Typography variant="subtitle1" gutterBottom color="error">
                    Rejection Preview:
                  </Typography>
                  <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
                    <List dense>
                      {uploadResult.rejected_preview.map((item, idx) => (
                        <ListItem key={idx} divider>
                          <ListItemText
                            primary={`Row Error: ${item.error}`}
                            secondary={`Data: ${JSON.stringify(item.data)}`}
                            primaryTypographyProps={{ color: 'error', variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUpload} variant="contained" disabled={uploading}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
