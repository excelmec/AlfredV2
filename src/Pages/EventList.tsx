import { Typography } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useEffect } from 'react';
import ProtectedRoute from '../Components/Protected/ProtectedRoute';
import { useEventList } from '../Hooks/Event/useEventsList';
import { IEventListItem } from '../Hooks/Event/eventTypes';

export default function EventListPage() {
	return (
		<ProtectedRoute>
			<EventList />
		</ProtectedRoute>
	);
}

function getRowId(row: IEventListItem) {
	return row.id;
}

function EventList() {
	const { eventList, fetchEventList, loading, error, columns } = useEventList();

	useEffect(() => {
		fetchEventList();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (error) {
		return <Typography variant='h5'>{error}</Typography>;
	}

	return (
		<>
			<br />
			<Typography variant='h5' noWrap component='div'>
				Event List
			</Typography>
			<br />
			<DataGrid
				density='compact'
				getRowId={getRowId}
				rows={eventList}
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
				showCellVerticalBorder
				showColumnVerticalBorder
			/>
		</>
	);
}
