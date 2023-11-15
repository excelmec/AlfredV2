import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	TextField,
	Typography,
} from '@mui/material';
import {
	DataGrid,
	GridActionsCellItem,
	GridRowParams,
	GridToolbar,
} from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { CaTeam, useCaTeamList } from 'Hooks/CampusAmbassador/useCaTeamList';
import { useNavigate } from 'react-router-dom';

import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

function getRowId(row: CaTeam) {
	return row.id;
}

export default function CaTeamListPage() {
	const {
		caTeamList,
		fetchCaTeamList,
		loading,
		error,
		columns,
		deleteCaTeam,
		teamDeleting,

		teamCreating,
		createCaTeam,
	} = useCaTeamList();

	const [teamToBeDeleted, setTeamToBeDeleted] = useState<CaTeam | null>(null);
	const [deleteOpen, setDeleteOpen] = useState(false);

	const [createTeamOpen, setCreateTeamOpen] = useState(false);
	const [newTeamName, setNewTeamName] = useState('');

	const navigate = useNavigate();

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
						navigate(`/ca/team/${params.row.id}/view`);
					}}
				/>,
				<GridActionsCellItem
					icon={<DeleteIcon color='error' />}
					label='Delete'
					onClick={() => {
						setTeamToBeDeleted(params.row);
						confirmDelete();
					}}
				/>,
			],
		},
	];

	function confirmDelete() {
		setDeleteOpen(true);
	}

	async function handleDelete(teamId: number) {
		await deleteCaTeam(teamId);
		handleDeleteClose();
	}

	const handleDeleteClose = () => {
		if (teamDeleting) {
			return;
		}
		setDeleteOpen(false);
	};

	const handleCreateTeamClose = () => {
		if (teamCreating) {
			return;
		}
		setCreateTeamOpen(false);
	};

	async function handleCreateTeam() {
		await createCaTeam(newTeamName);
		handleCreateTeamClose();
	}

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
			<Button onClick={() => setCreateTeamOpen(true)} variant='contained'>
				Create New Team
			</Button>
			<br />
			<DataGrid
				density='compact'
				getRowId={getRowId}
				rows={caTeamList}
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
			/>

			<Dialog open={deleteOpen} onClose={handleDeleteClose}>
				<DialogTitle>
					Delete Team with ID: {teamToBeDeleted?.id}
				</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Would you like to delete team: {teamToBeDeleted?.name}?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button
						autoFocus
						onClick={() => {
							handleDelete(teamToBeDeleted?.id as number);
						}}
						disabled={teamDeleting}
					>
						Delete
					</Button>
					<Button
						onClick={handleDeleteClose}
						autoFocus
						disabled={teamDeleting}
					>
						Cancel
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog open={createTeamOpen} onClose={handleCreateTeamClose}>
				<DialogTitle>Create New Team</DialogTitle>
				<DialogContent>
					<TextField
						sx={{
							m: 4,
						}}
						value={newTeamName}
						onChange={(e) => {
							setNewTeamName(e.target.value);
						}}
						label='Enter New Team Name'
					/>
				</DialogContent>
				<DialogActions>
					<Button
						autoFocus
						onClick={() => {
							handleCreateTeam();
						}}
						disabled={teamCreating}
					>
						Create
					</Button>
					<Button
						onClick={handleCreateTeamClose}
						autoFocus
						disabled={teamCreating}
					>
						Cancel
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
