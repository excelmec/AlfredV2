import { Typography } from '@mui/material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { User, getUsersList } from '../utils/api';
import ProtectedRoute from '../Components/Protected/ProtectedRoute';

function getRowId(row: User) {
	return row.email;
}

export default function CaList() {
	const [userList, setUserList] = useState<User[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	async function fetchUserList() {
		try {
			setLoading(true);
			const list = await getUsersList();
			console.log(list);
			setUserList(list);
		} catch (err) {
			console.log(err);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchUserList();
	}, []);
	return (
		<ProtectedRoute>
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
		</ProtectedRoute>
	);
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
