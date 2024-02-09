import {
	Button,
	// Dialog,
	// DialogActions,
	// DialogContent,
	// DialogContentText,
	// DialogTitle,
	Typography,
} from '@mui/material';

import {
	DataGrid,
	GridActionsCellItem,
	GridRowParams,
	GridToolbar,
} from '@mui/x-data-grid';

import { useEffect } from 'react';

import { useItemList } from '../../../Hooks/Merchandise/useItemList';
import { IItem } from 'Hooks/Merchandise/itemTypes';

import { useNavigate } from 'react-router-dom';

import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';

function getRowId(row: IItem) {
	return row.id;
}

export default function MerchItemListPage() {
	const { itemList, fetchItemList, loading, error, columns } = useItemList();

	const navigate = useNavigate();
	// const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
	// const [eventToDelete, setEventToDelete] = useState<
	// Pick<IEventListItem, 'id' | 'name'> | undefined
	// >();

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
						navigate(`/merch/items/view/${params.row.id}`);
					}}
				/>,
				<GridActionsCellItem
					icon={<EditIcon />}
					label='Edit'
					color='secondary'
					onClick={() => {
						navigate(`/merch/items/edit/${params.row.id}`);
					}}
				/>,
				<GridActionsCellItem
					icon={<DeleteIcon color='error' />}
					label='Delete'
					onClick={() => {
						alert('Coming Soon');
					}}
				/>,
			],
		},
	];

	// function confirmDelete() {
	// 	setDeleteOpen(true);
	// }

	// async function handleDelete(eventId: number, eventName: string) {
	// 	await deleteEvent(eventId, eventName);
	// 	handleDeleteClose();
	// }

	// const handleDeleteClose = () => {
	// 	if (eventIsDeleting) {
	// 		return;
	// 	}
	// 	setDeleteOpen(false);
	// };

	useEffect(() => {
		fetchItemList();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (error) {
		return <Typography variant='h5'>{error}</Typography>;
	}

	return (
		<>
			<br />
			<Typography variant='h5' noWrap component='div'>
				Merchandise Items List
			</Typography>
			<br />
			<Button
				size='small'
				variant='contained'
				onClick={() => navigate('/merch/items/create')}
			>
				Create New Item
			</Button>
			<br />
			<DataGrid
				density='compact'
				getRowId={getRowId}
				rows={itemList}
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

			{/* <Dialog open={deleteOpen} onClose={handleDeleteClose}>
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
			</Dialog> */}
		</>
	);
}
