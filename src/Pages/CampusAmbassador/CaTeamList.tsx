import { Typography } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useEffect } from 'react';
import ProtectedRoute from 'Components/Protected/ProtectedRoute';
import { CaTeam, useCaTeamList } from 'Hooks/CampusAmbassador/useCaTeamList';

export default function CaTeamListPage() {
	return (
		<ProtectedRoute>
			<CaTeamList />
		</ProtectedRoute>
	);
}

function getRowId(row: CaTeam) {
	return row.id;
}

function CaTeamList() {
	const { caTeamList, fetchCaTeamList, loading, error, columns } = useCaTeamList();

	useEffect(() => {
		fetchCaTeamList();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (error) {
		return <Typography variant='h5'>{error}</Typography>;
	}

	return (
		<>
			<br />
			<Typography variant='h5' noWrap component='div'>
				Campus Ambassadors Team List
			</Typography>
			<br />
			<DataGrid
				density='compact'
				getRowId={getRowId}
				rows={caTeamList}
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

