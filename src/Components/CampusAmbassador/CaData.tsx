import {
	Box,
	Button,
	Grid,
	IconButton,
	Paper,
	Table,
	TableBody,
	TableContainer,
	TableHead,
	TableRow,
	TextField,
	Typography,
} from '@mui/material';
import { CaData, CaPointLog } from 'Hooks/CampusAmbassador/useCa';
import { StyledTableCell } from './TableCell';

import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import './CaData.css';

import { useState } from 'react';

export default function CaDataView({
	ca,
	caPointLog,
	addNewPoint,
	savingNewPoint,
	deletePoint,
	deletingPoint,
}: {
	ca: CaData;
	caPointLog: CaPointLog[];
	addNewPoint: (point: Omit<CaPointLog, 'id'>) => Promise<void>;
	savingNewPoint: boolean;
	deletePoint: (pointId: number) => Promise<void>;
	deletingPoint: boolean;
}) {
	const [addingNewPoint, setAddingNewPoint] = useState<boolean>(false);
	const [newPointDescription, setNewPointDescription] = useState<string>('');
	const [newPointValue, setNewPointValue] = useState<number>(0);

	async function saveNewPoint() {
		await addNewPoint({
			description: newPointDescription,
			pointAwarded: newPointValue,
			ambassadorId: ca.ambassadorId,
			dateTime: new Date().toISOString(),
		});

		setAddingNewPoint(false);
		setNewPointDescription('');
		setNewPointValue(0);
	}

	function PointLogTable() {
		return (
			<TableContainer component={Box}>
				<Table sx={{ width: '100%' }} size='small'>
					<TableHead>
						<TableRow>
							<StyledTableCell colSpan={6}>
								Points Awarded
							</StyledTableCell>
						</TableRow>
						<TableRow>
							<StyledTableCell>Date Time</StyledTableCell>
							<StyledTableCell>Description</StyledTableCell>
							<StyledTableCell>Points Awarded</StyledTableCell>
							<StyledTableCell>Remove Point</StyledTableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{caPointLog.map((row) => (
							<TableRow key={row.id}>
								<StyledTableCell component='th' scope='row'>
									{row.dateTime}
								</StyledTableCell>
								<StyledTableCell align='right'>
									{row.description}
								</StyledTableCell>
								<StyledTableCell align='right'>
									{row.pointAwarded}
								</StyledTableCell>
								<StyledTableCell align='right'>
									<IconButton
										aria-label='delete'
										color='error'
										onClick={() => {
											if (
												window.confirm(
													'Do you want to delete this point?'
												)
											) {
												deletePoint(row.id);
											}
										}}
										disabled={deletingPoint}
									>
										<RemoveCircleIcon />
									</IconButton>
								</StyledTableCell>
							</TableRow>
						))}
						{!addingNewPoint && (
							<TableRow>
								<StyledTableCell colSpan={6}>
									<Button
										variant='contained'
										startIcon={<AddCircleOutlineIcon />}
										onClick={() => {
											setAddingNewPoint(true);
										}}
									>
										Add New Point
									</Button>
								</StyledTableCell>
							</TableRow>
						)}
						{addingNewPoint && (
							<TableRow>
								<StyledTableCell>
									<TextField
										label='Points Awarded'
										variant='outlined'
										fullWidth
										value={newPointValue}
										type='number'
										onChange={(e) => {
											setNewPointValue(
												Number(e.target.value)
											);
										}}
									/>
								</StyledTableCell>
								<StyledTableCell>
									<TextField
										label='Description'
										variant='outlined'
										fullWidth
										value={newPointDescription}
										onChange={(e) => {
											setNewPointDescription(
												e.target.value
											);
										}}
									/>
								</StyledTableCell>
								<StyledTableCell>
									<Button
										variant='contained'
										startIcon={<SaveIcon />}
										onClick={saveNewPoint}
										disabled={savingNewPoint}
									>
										Save
									</Button>
								</StyledTableCell>
								<StyledTableCell>
									<Button
										variant='contained'
										startIcon={<CancelIcon />}
										onClick={() => {
											setAddingNewPoint(false);
										}}
										disabled={savingNewPoint}
									>
										Cancel
									</Button>
								</StyledTableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</TableContainer>
		);
	}

	return (
		<Box
			className='ca-data-container'
			component={Paper}
			elevation={2}
			borderRadius={0}
		>
			<Grid
				container
				spacing={2}
				justifyContent='center'
				alignItems='center'
				className='ca-data-grid'
			>
				<Grid item xs={6}>
					<Typography>Ambassador ID</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{ca.ambassadorId}</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>Name</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{ca.name}</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>Email</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{ca.email}</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>Referral Points</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{ca.referralPoints}</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>Bonus Points</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{ca.bonusPoints}</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>Total Points</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{ca.totalPoints}</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>Team Name</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{ca.teamName}</Typography>
				</Grid>

				<Grid item xs={12}>
					<PointLogTable />
				</Grid>
			</Grid>
		</Box>
	);
}
