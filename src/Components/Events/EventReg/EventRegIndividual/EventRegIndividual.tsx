import {
	DataGrid,
	GridActionsCellItem,
	GridColumnVisibilityModel,
	GridRowParams,
	GridToolbar,
} from '@mui/x-data-grid';
import { IRegistration } from 'Hooks/Event/registrationTypes';
import { TypeSafeColDef } from 'Hooks/gridColumType';
import VisibilityIcon from '@mui/icons-material/Visibility';
import './EventRegIndividual.css';
import { IUser } from 'Hooks/useUserList';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	Grid,
	Typography,
} from '@mui/material';
import { useState } from 'react';

export default function EventRegIndividual({
	individualRegsLoading,
	eventRegsIndividual,
	regIndividualCols,
	checkInIndividual,
	isTeam,
}: {
	individualRegsLoading: boolean;
	eventRegsIndividual: IRegistration[];
	regIndividualCols: TypeSafeColDef<IRegistration>[];
	checkInIndividual: (registration: IRegistration) => Promise<void>;
	isTeam: boolean;
}) {
	const initialColVisibility: GridColumnVisibilityModel = {
		'user.category': false,
		ambassadorId: false,
		teamId: isTeam,
		'team.name': isTeam,
	};
	const [userDetailsOpen, setUserDetailsOpen] = useState(false);
	const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

	const muiColumns = [
		{
			field: 'actions',
			headerName: 'Actions',
			type: 'actions',
			width: 70,
			getActions: (params: GridRowParams<IRegistration>) => [
				<GridActionsCellItem
					icon={<VisibilityIcon color='primary' />}
					label='View'
					onClick={() => {
						setSelectedUser(params.row?.user);
						setUserDetailsOpen(true);
					}}
				/>,
			],
		},
		{
			field: "checkedIn",
			headerName: "Checked In",
			type: "actions",
			width: 95,
			getActions: (params: GridRowParams<IRegistration>) => [
				<GridActionsCellItem
					icon={<input id="test" type="checkbox" defaultChecked={params.row?.checkedIn}></input>}
					label='Check in'
					onClick={(event) => {
						const target = event?.target as HTMLInputElement;
						if (params.row) {
							params.row.checkedIn = target.checked
							checkInIndividual(params.row)
						}
					}}
				/>,
			]
		},
		...regIndividualCols,
	];

	return (
		<>
			<DataGrid
				density='compact'
				getRowId={getRowId}
				rows={eventRegsIndividual}
				columns={muiColumns}
				loading={individualRegsLoading}
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
				initialState={{
					columns: {
						columnVisibilityModel: initialColVisibility,
					},
				}}
			/>

			<Dialog
				open={userDetailsOpen}
				onClose={() => setUserDetailsOpen(false)}
				maxWidth='md'
				fullWidth
			>
				<DialogTitle>User Details</DialogTitle>
				<DialogContent>
					<UserDetails user={selectedUser} />
				</DialogContent>
				<DialogActions>
					<Button
						autoFocus
						onClick={() => setUserDetailsOpen(false)}
						variant='contained'
					>
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}

function getRowId(row: IRegistration) {
	return row.excelId?.toString();
}

function UserDetails({ user }: { user: IUser | null }) {
	if (!user) {
		return <Typography variant='h5'>No User selected</Typography>;
	}

	return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<Divider />
			</Grid>
			<Grid item xs={6}>
				<Typography variant='body2'>User ID</Typography>
			</Grid>
			<Grid item xs={6}>
				<Typography variant='body2'>{user?.id}</Typography>
			</Grid>
			<Grid item xs={6}>
				<Typography variant='body2'>Name</Typography>
			</Grid>
			<Grid item xs={6}>
				<Typography variant='body2'>{user?.name}</Typography>
			</Grid>
			<Grid item xs={6}>
				<Typography variant='body2'>Email</Typography>
			</Grid>
			<Grid item xs={6}>
				<Typography variant='body2'>{user?.email}</Typography>
			</Grid>

			<Grid item xs={6}>
				<Typography variant='body2'>Mobile</Typography>
			</Grid>
			<Grid item xs={6}>
				<Typography variant='body2'>{user?.mobileNumber}</Typography>
			</Grid>

			<Grid item xs={6}>
				<Typography variant='body2'>Institution</Typography>
			</Grid>
			<Grid item xs={6}>
				<Typography variant='body2'>{user.institution}</Typography>
			</Grid>

			<Grid item xs={12}>
				<Divider />
			</Grid>
		</Grid>
	);
}
