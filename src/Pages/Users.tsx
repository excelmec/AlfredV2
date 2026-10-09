import { useEffect, useState } from 'react';
import { PencilSimpleIcon } from '@phosphor-icons/react';
import { IUser, useUserList } from '../Hooks/useUserList';
import { PageHeader } from '@/Components/page-header';
import { PageError } from '@/Components/page-state';
import { DataTable } from '@/Components/data-table/DataTable';
import { RowAction } from '@/Components/data-table/RowAction';
import type { DataColumn } from '@/Components/data-table/types';
import { Badge } from '@/Components/ui/badge';
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
import { Label } from '@/Components/ui/label';

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

function getRowId(row: IUser) {
  return row.email;
}

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

  const columns: DataColumn<IUser>[] = [
    { field: 'id', headerName: 'Excel ID', type: 'number', width: 90 },
    { field: 'name', headerName: 'Name', type: 'string', width: 150 },
    { field: 'email', headerName: 'Email ID', type: 'string', width: 220 },
    { field: 'gender', headerName: 'Gender', type: 'string', width: 80 },
    { field: 'mobileNumber', headerName: 'Mobile Number', type: 'string', width: 120 },
    { field: 'institution', headerName: 'Institution', type: 'string', width: 180 },
    {
      field: 'role',
      headerName: 'Role',
      type: 'string',
      width: 200,
      renderCell: (params) => (
        <div className="flex items-center gap-1">
          <div className="flex flex-wrap gap-1">
            {String(params.value ?? '')
              .split(',')
              .filter(Boolean)
              .map((role) => (
                <Badge key={role} variant={role === 'Admin' ? 'default' : 'secondary'}>
                  {role}
                </Badge>
              ))}
          </div>
          <RowAction
            icon={<PencilSimpleIcon />}
            label="Edit roles"
            tone="primary"
            onClick={() => handleOpenModal(params.row)}
          />
        </div>
      ),
    },
    { field: 'category', headerName: 'Category', type: 'string', width: 120 },
  ];

  useEffect(() => {
    fetchUserList();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return <PageError>{error}</PageError>;
  }

  return (
    <>
      <PageHeader title="Users" description="Browse Excel accounts and manage their roles." />
      <DataTable
        columns={columns}
        rows={userList}
        getRowId={getRowId}
        loading={loading}
        exportFileName="users"
        searchPlaceholder="Search users..."
      />

      <Dialog open={openModal} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user roles</DialogTitle>
            <DialogDescription>
              {selectedUser ? `Select the roles for ${selectedUser.name}.` : 'Select roles.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {roles.map((role) => (
              <Label
                key={role}
                className="flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 font-medium has-[[data-state=checked]]:border-primary/50 has-[[data-state=checked]]:bg-primary/5"
              >
                <Checkbox
                  checked={selectedRoles.includes(role)}
                  onCheckedChange={() => handleRoleChange(role)}
                />
                {role}
              </Label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleSaveRoles}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
