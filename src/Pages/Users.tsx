import {
  TextField,
  Typography,
  IconButton,
  Modal,
  Box,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { DataGrid, GridColDef, GridRenderEditCellParams, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { IUser, useUserList } from '../Hooks/useUserList';

const roles = [
  'Admin',
  'Core',
  'Editor',
  'Staff',
  'Accountant',
  'User',
  'CaVolunteer',
  'MerchManage',
  'MECLabsAdmin',
];

export default function UserListPage() {
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const { userList, loading, error, fetchUserList, updateUserRole } = useUserList();

  const handleOpenModal = (user: IUser) => {
    setSelectedUser(user);
    setSelectedRoles(user.role.split(','));
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedUser(null);
  };

  const handleRoleChange = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const handleSaveRoles = async () => {
    if (selectedUser) {
      if (selectedRoles.join(',') === selectedUser.role) {
        handleCloseModal();
        return;
      }
      await updateUserRole(selectedUser.id, selectedRoles.join(','));
      handleCloseModal();
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Excel ID',
      type: 'number',
      width: 100,

      valueFormatter: ({ value }) => {
        /**
         * To remove comma from the number
         */
        return value;
      },
    },
    {
      field: 'name',
      headerName: 'Name',
      type: 'string',
      width: 150,
      ...expandOnDoubleClick,
    },
    {
      field: 'email',
      headerName: 'Email ID',
      type: 'string',
      width: 250,
      ...expandOnDoubleClick,
    },
    {
      field: 'gender',
      headerName: 'Gender',
      type: 'string',
      width: 70,
    },
    {
      field: 'mobileNumber',
      headerName: 'Mobile Number',
      type: 'string',
      width: 100,
    },
    {
      field: 'institution',
      headerName: 'Institution',
      type: 'string',
      width: 150,
      ...expandOnDoubleClick,
    },
    {
      field: 'role',
      headerName: 'Role',
      type: 'string',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Typography
            variant="body2"
            sx={{
              flexGrow: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginRight: 1,
            }}
          >
            {params.value}
          </Typography>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(params.row);
            }}
            sx={{ flexShrink: 0 }}
          >
            <EditIcon fontSize="small" color="secondary" />
          </IconButton>
        </Box>
      ),
      ...expandOnDoubleClick,
    },
    {
      field: 'category',
      headerName: 'Category',
      type: 'string',
      width: 150,
    },
  ];

  useEffect(() => {
    fetchUserList();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return <Typography variant="h5">{error}</Typography>;
  }

  return (
    <>
      <br />
      <Typography variant="h5" noWrap component="div">
        Users List
      </Typography>
      <br />
      <DataGrid
        disableRowSelectionOnClick
        density="compact"
        getRowId={getRowId}
        rows={userList}
        columns={columns}
        loading={loading}
        sx={{
          width: '90%',
        }}
        autoPageSize
        slots={{
          toolbar: GridToolbar,
        }}
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
      <Modal open={openModal} onClose={handleCloseModal} aria-labelledby="role-modal-title">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography id="role-modal-title" variant="h6" component="h2" gutterBottom>
            Edit User Roles
          </Typography>
          <FormControl component="fieldset" variant="standard">
            <FormLabel component="legend">Select Roles</FormLabel>
            <FormGroup>
              {roles.map((role, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      checked={selectedRoles.includes(role)}
                      onChange={() => handleRoleChange(role)}
                    />
                  }
                  label={role}
                />
              ))}
            </FormGroup>
          </FormControl>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button onClick={handleSaveRoles} variant="contained">
              Save
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
}
function getRowId(row: IUser) {
  return row.email;
}

const expandOnDoubleClick = {
  /**
   * Editting is not supported
   * this only lets the user to expand the cell in order to see the full text
   */
  editable: true,
  renderEditCell: (params: GridRenderEditCellParams) => (
    <TextField
      variant="outlined"
      sx={{
        position: 'absolute',
        backgroundColor: 'white',
      }}
      InputProps={{
        style: { width: `${params.value.toString().length + 10}ch` },
      }}
      value={params.value}
    />
  ),
};
