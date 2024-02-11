import { useEffect, useState } from 'react';
import { Button, Typography } from '@mui/material';
import ProtectedRoute from '../../Components/Protected/ProtectedRoute';
import {
	DataGrid,
	GridActionsCellItem,
	GridRowParams,
	GridToolbar,
} from '@mui/x-data-grid';

import { useEventHeadsList } from 'Hooks/Event/eventHeads/useEventHeadsList';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { IEventHead } from 'Hooks/Event/eventTypes';
import EventHeadCreateModal from 'Components/Events/EventHeads/EventHeadCreate';
import { useEventHeadCrud } from 'Hooks/Event/eventHeads/useEventHeadCrud';
import { toast } from 'react-toastify';
import EventHeadEditModal from 'Components/Events/EventHeads/EventHeadEdit';
import { useLocation, useNavigate } from 'react-router-dom';

export default function EventHeadsPage() {
	return (
		<ProtectedRoute>
			<EventHeads />
		</ProtectedRoute>
	);
}

function getRowId(row: IEventHead) {
	return row.id;
}

export function EventHeads() {
	const location = useLocation();
	const navigate = useNavigate();
	const { eventHeadsList, fetchEventHeadsList, error, loading, columns } =
		useEventHeadsList();

	const { deleteEventHead } = useEventHeadCrud();

	const [createHeadModalOpen, setCreateHeadModalOpen] =
		useState<boolean>(false);

	const [editHeadModalOpen, setEditHeadModalOpen] = useState<boolean>(false);
	const [editHeadId, setEditHeadId] = useState<number>(0);

	const muiColumns = [
		...columns,
		{
			field: 'actions',
			headerName: 'Actions',
			type: 'actions',
			width: 150,
			getActions: (params: GridRowParams<IEventHead>) => {
				return [
					<GridActionsCellItem
						icon={<EditIcon />}
						label='Edit'
						color='secondary'
						onClick={() => {
							setEditHeadId(params.row.id);
							setEditHeadModalOpen(true);
						}}
					/>,
					<GridActionsCellItem
						icon={<DeleteIcon color='error' />}
						label='Delete'
						onClick={async () => {
							if (
								window.confirm(
									'Are you sure you want to delete this event head?'
								)
							) {
								const success = await deleteEventHead(
									params.row.id,
									params.row.name
								);
								if (success) {
									fetchEventHeadsList();
									toast.success(
										'Event head deleted successfully'
									);
								}
							}
						}}
					/>,
				];
			},
		},
	];

	useEffect(() => {
		fetchEventHeadsList();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (location?.pathname.endsWith('create')) {
			setCreateHeadModalOpen(true);
			navigate('/events/heads');
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.pathname]);

	if (error) {
		return <Typography variant='h5'>{error}</Typography>;
	}

	return (
		<>
			<br />
			<Typography variant='h5' noWrap component='div'>
				Event Heads List
			</Typography>
			<br />
			<Button
				variant='contained'
				onClick={() => setCreateHeadModalOpen(true)}
			>
				Create Event Head
			</Button>
			<br />
			<DataGrid
				density='compact'
				getRowId={getRowId}
				rows={eventHeadsList}
				columns={muiColumns}
				editMode='row'
				loading={loading}
				sx={{
					width: '90%',
				}}
				autoPageSize
				slots={{ toolbar: GridToolbar }}
				slotProps={{
					toolbar: {
						showQuickFilter: true,
						printOptions: {
							hideFooter: true,
							hideHeader: true,
							hideToolbar: true,
						}
					},
				}}
				showCellVerticalBorder
				showColumnVerticalBorder
			/>

			<EventHeadCreateModal
				open={createHeadModalOpen}
				setOpen={setCreateHeadModalOpen}
				refreshList={fetchEventHeadsList}
			/>

			{editHeadModalOpen && (
				<EventHeadEditModal
					open={editHeadModalOpen}
					setOpen={setEditHeadModalOpen}
					refreshList={fetchEventHeadsList}
					eventHeadId={editHeadId}
				/>
			)}
		</>
	);
}
