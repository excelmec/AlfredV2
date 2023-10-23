import { Typography } from '@mui/material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { CA, getCaList } from '../utils/api';

function getRowId(row: CA) {
	return row.ambassadorId;
}

export default function CaList() {
	const [caList, setCaList] = useState<CA[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	async function fetchCaList() {
		try {
			setLoading(true);
			const list = await getCaList();
			setCaList(list);
		} catch (err) {
			console.log(err);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchCaList();
	}, []);
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
