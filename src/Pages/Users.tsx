import { Typography } from '@mui/material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { useEffect } from 'react';
import ProtectedRoute from '../Components/Protected/ProtectedRoute';
import { User, useUserList } from '../Hooks/useUserList';

export default function CaListPage() {
	return (
		<ProtectedRoute>
			<CaList />
		</ProtectedRoute>
	);
}

function CaList() {
	const { userList, loading, error, fetchUserList } = useUserList();

	useEffect(() => {
		fetchUserList();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (error) {
		return <Typography variant='h5'>{error}</Typography>;
	}

	return (
		<>
			<Typography variant='h3' noWrap component='div'>
				Users List
			</Typography>
			<br />
			<DataGrid
				density='compact'
				getRowId={getRowId}
				rows={userList}
				columns={columns}
				loading={loading}
				sx={{
					width: '90%',
				}}
				autoPageSize
				slots={{ toolbar: GridToolbar }}
				slotProps={{
					toolbar: {
						showQuickFilter: true,
					},
				}}
			/>
		</>
	);
}
function getRowId(row: User) {
	return row.email;
}

const columns: GridColDef[] = [
	{ field: 'id', headerName: 'Excel ID', type: 'number', width: 100 },
	{ field: 'name', headerName: 'Name', type: 'string', width: 150 },
	{ field: 'email', headerName: 'Email ID', type: 'string', width: 250 },
	{
		field: 'role',
		headerName: 'Role',
		type: 'string',
		width: 100,
	},
	{
		field: 'gender',
		headerName: 'Gender',
		type: 'string',
		width: 100,
	},
	{
		field: 'mobileNumber',
		headerName: 'Mobile Number',
		type: 'string',
		width: 100,
	},
	{ field: 'category', headerName: 'Category', type: 'string', width: 150 },
];
