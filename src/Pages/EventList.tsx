import { Typography } from '@mui/material';
import {
	DataGrid,
	GridActionsCellItem,
	GridColDef,
	GridRowParams,
	GridToolbar,
} from '@mui/x-data-grid';
import { useEffect } from 'react';
import ProtectedRoute from '../Components/Protected/ProtectedRoute';
import { Event, useEventList } from '../Hooks/useEventsList';

import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';

export default function EventListPage() {
	return (
		<ProtectedRoute>
			<EventList />
		</ProtectedRoute>
	);
}

function getRowId(row: Event) {
	return row.id;
}

function EventList() {
	const { eventList, fetchEventList, loading, error } = useEventList();

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

type TypeSafeColDef<T> = GridColDef & { field: keyof T };
const columns: TypeSafeColDef<
	Event & {
		actions: null;
	}
>[] = [
	{
		field: 'id',
		headerName: 'ID',
		type: 'number',
		align: 'center',
		headerAlign: 'center',
		width: 10,
	},
	{
		field: 'name',
		headerName: 'Name',
		type: 'string',
		width: 150,
	},
	{
		field: 'icon',
		headerName: 'Icon',
		type: 'string',
		width: 100,
		align: 'center',
		renderCell: (params) => {
			return (
				<img
					src={params.value}
					alt={'icon'}
					style={{
						maxWidth: '100%',
						maxHeight: '100%',
					}}
					referrerPolicy='no-referrer'
				/>
			);
		},
	},
	{
		field: 'eventType',
		headerName: 'Event Type',
		type: 'string',
		width: 100,
	},
	{
		field: 'category',
		headerName: 'Category',
		type: 'string',
		width: 100,
	},
	{
		field: 'venue',
		headerName: 'Venue',
		type: 'string',
		width: 130,
	},
	{
		field: 'needRegistration',
		headerName: 'Needs Registration',
		type: 'boolean',
		width: 100,
	},
	{
		field: 'day',
		headerName: 'Day',
		type: 'number',
		width: 10,
		align: 'center',
	},
	{
		field: 'datetime',
		headerName: 'DateTime',
		type: 'string',
		width: 150,
		valueGetter: (params) => {
			const date = new Date(params.row.datetime);
			return date.toLocaleString([], {
				year: '2-digit',
				month: 'numeric',
				day: 'numeric',
				hour: 'numeric',
				minute: 'numeric',
			});
		},
	},

	{
		field: 'actions',
		headerName: 'Actions',
		type: 'actions',
		width: 150,
		getActions: (params: GridRowParams) => [
			<GridActionsCellItem
				icon={<VisibilityIcon color='primary' />}
				label='View'
			/>,
			<GridActionsCellItem
				icon={<EditIcon />}
				label='Edit'
				color='secondary'
			/>,
			<GridActionsCellItem
				icon={<DeleteIcon color='error' />}
				label='Delete'
			/>,
		],
	},
];
