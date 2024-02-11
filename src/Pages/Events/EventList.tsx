import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Typography,
} from '@mui/material';
import {
	DataGrid,
	GridActionsCellItem,
	GridRowParams,
	GridToolbar,
} from '@mui/x-data-grid';
import { useContext, useEffect, useState } from 'react';
import { useEventList } from '../../Hooks/Event/useEventsList';
import { IEventListItem } from '../../Hooks/Event/eventTypes';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import UserContext from 'Contexts/User/UserContext';
import {
	allEventEditRoles,
	allEventViewRoles,
	specificEventViewRoles,
} from 'Hooks/Event/eventRoles';

function getRowId(row: IEventListItem) {
	return row.id;
}

export default function EventListPage() {
	const { userData } = useContext(UserContext);

	const {
		eventList,
		fetchEventList,
		loading,
		error,
		setError,
		columns,
		deleteEvent,
		eventIsDeleting,
	} = useEventList();

	const [viewableEvents, setViewableEvents] = useState<IEventListItem[]>([]);

	const navigate = useNavigate();
	const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
	const [eventToDelete, setEventToDelete] = useState<
		Pick<IEventListItem, 'id' | 'name'> | undefined
	>();

	const muiColumns = [
		...columns,
		{
			field: 'actions',
			headerName: 'Actions',
			type: 'actions',
			width: 150,
			getActions: (params: GridRowParams) => [
				<GridActionsCellItem
					icon={<VisibilityIcon color='primary' />}
					label='View'
					onClick={() => {
						navigate(`/events/view/${params.row.id}`);
					}}
				/>,
				<GridActionsCellItem
					icon={<EditIcon />}
					label='Edit'
					color='secondary'
					onClick={() => {
						navigate(`/events/edit/${params.row.id}`);
					}}
				/>,
				<GridActionsCellItem
					icon={<DeleteIcon color='error' />}
					label='Delete'
					onClick={() => {
						setEventToDelete({
							id: params.row.id,
							name: params.row.name,
						});
						confirmDelete();
					}}
				/>,
			],
		},
	];

	function confirmDelete() {
		if (userData.roles.some((role) => allEventEditRoles.includes(role))) {
			setDeleteOpen(true);
		} else {
			alert('You do not have permission to perform this action.');
		}
	}

	async function handleDelete(eventId: number, eventName: string) {
		await deleteEvent(eventId, eventName);
		handleDeleteClose();
	}

	const handleDeleteClose = () => {
		if (eventIsDeleting) {
			return;
		}
		setDeleteOpen(false);
	};

	useEffect(() => {
		fetchEventList();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (loading) return;
		if (eventList?.length === 0) return;

		if (userData.roles.some((role) => allEventEditRoles.includes(role))) {
			// This person has edit access to all events, so can view all
			setViewableEvents(eventList);
		} else if (
			userData.roles.some((role) => allEventViewRoles.includes(role))
		) {
			// This person has view access to all events, so can view all
			setViewableEvents(eventList);
		} else if (
			userData.roles.some((role) => specificEventViewRoles.includes(role))
		) {
			// This person only has view access to events where they are the event head
			const filteredEvents = eventList.filter((event) => {
				return (
					event.eventHead1?.email === userData.email ||
					event.eventHead2?.email === userData.email
				);
			});
			setViewableEvents(filteredEvents);
			if (filteredEvents.length === 0) {
				setError('You do not have permission to view this page');
			}
		} else {
			// This person has no access to any event
			setViewableEvents([]);
			setError('You do not have permission to view this page');
		}
	}, [eventList]);

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
			<Button
				size='small'
				variant='contained'
				onClick={() => navigate('/events/create')}
			>
				Create New Event
			</Button>
			<br />
			<DataGrid
				density='compact'
				getRowId={getRowId}
				rows={viewableEvents}
				columns={muiColumns}
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

			<Dialog open={deleteOpen} onClose={handleDeleteClose}>
				<DialogTitle>
					Delete Event with ID: {eventToDelete?.id}
				</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Would you like to delete Event: {eventToDelete?.name}?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button
						autoFocus
						onClick={() => {
							handleDelete(
								eventToDelete?.id as number,
								eventToDelete?.name as string
							);
						}}
						disabled={eventIsDeleting}
					>
						Delete
					</Button>
					<Button
						onClick={handleDeleteClose}
						autoFocus
						disabled={eventIsDeleting}
					>
						Cancel
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
