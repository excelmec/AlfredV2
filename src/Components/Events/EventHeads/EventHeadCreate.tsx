import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	TextField,
	Typography,
} from '@mui/material';
import { useEventHeadCrud } from 'Hooks/Event/eventHeads/useEventHeadCrud';
import { useEffect } from 'react';
import './EventHeadLoader.css';
import { toast } from 'react-toastify';

export default function EventHeadCreateModal({
	open,
	setOpen,
	refreshList,
}: {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	refreshList: () => void;
}) {
	const {
		setEventHead,
		eventHead,
		eventHeadLoading,
		error,
		createEventHead,
	} = useEventHeadCrud();

	function handleClose() {
		if (eventHeadLoading) {
			return;
		}

		setOpen(false);
	}

	async function handleSave() {
		if (eventHeadLoading) {
			return;
		}

		const success = await createEventHead();
		if (success) {
			setOpen(false);
			toast.success('Event head created successfully');
			refreshList();
			setEventHead({
				id: 0,
				name: '',
				email: '',
				phoneNumber: '',
			});
		}
	}

	useEffect(() => {
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Dialog open={open} onClose={setOpen}>
			<DialogTitle>Create Event Head</DialogTitle>
			<DialogContent>
				<div
					className='event-head-loading-overlay'
					style={{ display: eventHeadLoading ? 'flex' : 'none' }}
				>
					<CircularProgress />
				</div>
				<Grid container spacing={2}>
					<Grid item xs={6}>
						<Typography variant='h6'>Name</Typography>
					</Grid>
					<Grid item xs={6}>
						<TextField
							variant='outlined'
							fullWidth
							size='small'
							required
							placeholder='Enter name'
							disabled={eventHeadLoading}
							value={eventHead.name}
							onChange={(e) => {
								setEventHead({
									...eventHead,
									name: e.target.value,
								});
							}}
						/>
					</Grid>
					<Grid item xs={6}>
						<Typography variant='h6'>Email</Typography>
					</Grid>
					<Grid item xs={6}>
						<TextField
							variant='outlined'
							fullWidth
							size='small'
							required
							placeholder='Enter email'
							disabled={eventHeadLoading}
							value={eventHead.email}
							onChange={(e) => {
								setEventHead({
									...eventHead,
									email: e.target.value,
								});
							}}
						/>
					</Grid>
					<Grid item xs={6}>
						<Typography variant='h6'>Phone Number</Typography>
					</Grid>
					<Grid item xs={6}>
						<TextField
							variant='outlined'
							fullWidth
							size='small'
							required
							placeholder='Enter phone number'
							disabled={eventHeadLoading}
							value={eventHead.phoneNumber}
							onChange={(e) => {
								setEventHead({
									...eventHead,
									phoneNumber: e.target.value,
								});
							}}
						/>
					</Grid>
					{error && (
						<Grid item xs={12}>
							<Typography variant='h6' color='error'>
								{error}
							</Typography>
						</Grid>
					)}
				</Grid>
			</DialogContent>
			<DialogActions>
				<Button
					autoFocus
					onClick={handleSave}
					disabled={eventHeadLoading}
				>
					Create
				</Button>
				<Button
					onClick={handleClose}
					autoFocus
					disabled={eventHeadLoading}
				>
					Cancel
				</Button>
			</DialogActions>
		</Dialog>
	);
}
