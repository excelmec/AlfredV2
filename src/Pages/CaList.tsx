import { Typography } from '@mui/material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { useEffect } from 'react';
import ProtectedRoute from '../Components/Protected/ProtectedRoute';
import { CA, useCaList } from '../Hooks/useCaList';

export default function CaListPage() {
	return (
		<ProtectedRoute>
			<CaList />
		</ProtectedRoute>
	);
}

function getRowId(row: CA) {
	return row.ambassadorId;
}

function CaList() {
	const { caList, fetchCaList, loading, error } = useCaList();

	useEffect(() => {
		fetchCaList();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (error) {
		return <Typography variant='h5'>{error}</Typography>;
	}

	return (
		<>
			<Typography variant='h3' noWrap component='div'>
				Campus Ambassadors List
			</Typography>
			<br />
			<DataGrid
				density='compact'
				getRowId={getRowId}
				rows={caList}
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

const columns: GridColDef[] = [
	{ field: 'name', headerName: 'Name', type: 'string', width: 150 },
	{
		field: 'referralPoints',
		headerName: 'Referal Pts',
		type: 'number',
		width: 100,
	},
	{
		field: 'bonusPoints',
		headerName: 'Bonus Pts',
		type: 'number',
		width: 100,
	},
	{
		field: 'totalPoints',
		headerName: 'Total Pts',
		type: 'number',
		width: 100,
	},
	{ field: 'caTeamId', headerName: 'Team ID', type: 'number', width: 150 },
	{ field: 'email', headerName: 'Email ID', type: 'string', width: 250 },
];
