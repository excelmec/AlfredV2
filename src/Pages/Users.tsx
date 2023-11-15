import { TextField, Typography } from '@mui/material';
import {
	DataGrid,
	GridColDef,
	GridRenderEditCellParams,
	GridToolbar,
} from '@mui/x-data-grid';
import { useEffect } from 'react';
import { User, useUserList } from '../Hooks/useUserList';

export default function UserListPage() {
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
			<br />
			<Typography variant='h5' noWrap component='div'>
				Users List
			</Typography>
			<br />
			<DataGrid
				disableRowSelectionOnClick
				density='compact'
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
					},
				}}
			/>
		</>
	);
}
function getRowId(row: User) {
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
			variant='outlined'
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
		width: 100,
		...expandOnDoubleClick,
	},
	{
		field: 'category',
		headerName: 'Category',
		type: 'string',
		width: 150,
	},
];
