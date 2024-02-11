import {
	DataGrid,
	GridActionsCellItem,
	GridRowParams,
	GridToolbar,
} from '@mui/x-data-grid';
import { ITeam } from 'Hooks/Event/registrationTypes';
import { TypeSafeColDef } from 'Hooks/gridColumType';
import VisibilityIcon from '@mui/icons-material/Visibility';

import './EventRegTeams.css';
import { useState } from 'react';
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

export default function EventRegTeams({
	institutionMap,

	teamCols,
	eventRegsTeam,
	teamRegsLoading,
}: {
	institutionMap: Map<number, string>;
	teamCols: TypeSafeColDef<ITeam>[];
	eventRegsTeam: ITeam[];
	teamRegsLoading: boolean;
}) {
	const [teamDetailsOpen, setTeamDetailsOpen] = useState(false);
	const [selectedTeam, setSelectedTeam] = useState<ITeam | null>(null);

	const muiColumns = [
		{
			field: 'actions',
			headerName: 'Actions',
			type: 'actions',
			width: 70,
			getActions: (params: GridRowParams<ITeam>) => [
				<GridActionsCellItem
					icon={<VisibilityIcon color='primary' />}
					label='View'
					onClick={() => {
						setSelectedTeam(params.row);
						setTeamDetailsOpen(true);
					}}
				/>,
			],
		},
		...teamCols,
	];

	return (
		<>
			<DataGrid
				density='compact'
				getRowId={getRowId}
				rows={eventRegsTeam}
				columns={muiColumns}
				loading={teamRegsLoading}
				autoPageSize
				slots={{ toolbar: GridToolbar }}
				slotProps={{
					toolbar: {
						showQuickFilter: true,
					},
				}}
				showCellVerticalBorder
				showColumnVerticalBorder
				initialState={{
					columns: {
						columnVisibilityModel: {
							ambassadorId: false,
						},
					},
				}}
			/>

			<Dialog
				open={teamDetailsOpen}
				onClose={() => setTeamDetailsOpen(false)}
				maxWidth='md'
				fullWidth
			>
				<DialogTitle>Team Details</DialogTitle>
				<DialogContent>
					<TeamDetails
						team={selectedTeam}
						institutionMap={institutionMap}
					/>
				</DialogContent>
				<DialogActions>
					<Button
						autoFocus
						onClick={() => setTeamDetailsOpen(false)}
						variant='contained'
					>
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}

function getRowId(row: ITeam) {
	return row.id?.toString();
}

function TeamDetails({
	team,
	institutionMap,
}: {
	team: ITeam | null;
	institutionMap: Map<number, string>;
}) {
	if (!team) {
		return <Typography variant='h5'>No team selected</Typography>;
	}

	return (
		<Grid container spacing={2}>
			<Grid item xs={6}>
				<Typography variant='body2'>Team Name</Typography>
			</Grid>
			<Grid item xs={6}>
				<Typography variant='body2'>{team.name}</Typography>
			</Grid>
			<Grid item xs={6}>
				<Typography variant='body2'>Ambassador ID</Typography>
			</Grid>
			<Grid item xs={6}>
				<Typography variant='body2'>
					{team.ambassadorId?.toString()}
				</Typography>
			</Grid>
			<Grid item xs={6}>
				<Typography variant='body2'>Member Count</Typography>
			</Grid>
			<Grid item xs={6}>
				<Typography variant='body2'>
					{team.registrations.length.toString()}
				</Typography>
			</Grid>
			{team.registrations.map((reg, index) => (
				<>
					<Grid
						item
						xs={12}
						key={`${reg.excelId.toString()}-divider`}
					>
						<Divider />
					</Grid>
					<Grid item xs={12} key={`${reg.excelId.toString()}-header`}>
						<Typography variant='h6'>Member {index + 1}</Typography>
					</Grid>
					<Grid item xs={6} key={`${reg.excelId.toString()}-name`}>
						<Typography variant='body2'>Name</Typography>
					</Grid>
					<Grid
						item
						xs={6}
						key={`${reg.excelId.toString()}-name-value`}
					>
						<Typography variant='body2'>
							{reg.user?.name}
						</Typography>
					</Grid>
					<Grid item xs={6} key={`${reg.excelId.toString()}-email`}>
						<Typography variant='body2'>Email</Typography>
					</Grid>
					<Grid
						item
						xs={6}
						key={`${reg.excelId.toString()}-email-value`}
					>
						<Typography variant='body2'>
							{reg.user?.email}
						</Typography>
					</Grid>

					{/* mobile */}
					<Grid item xs={6} key={`${reg.excelId.toString()}-mobile`}>
						<Typography variant='body2'>Mobile</Typography>
					</Grid>
					<Grid
						item
						xs={6}
						key={`${reg.excelId.toString()}-mobile-value`}
					>
						<Typography variant='body2'>
							{reg.user?.mobileNumber}
						</Typography>
					</Grid>

					<Grid
						item
						xs={6}
						key={`${reg.excelId.toString()}-institution`}
					>
						<Typography variant='body2'>Institution</Typography>
					</Grid>
					<Grid
						item
						xs={6}
						key={`${reg.excelId.toString()}-institution-value`}
					>
						<Typography variant='body2'>
							{institutionMap.get(reg.user?.institutionId ?? 0)}
						</Typography>
					</Grid>
				</>
			))}

			<Grid item xs={12}>
				<Divider />
			</Grid>
		</Grid>
	);
}
