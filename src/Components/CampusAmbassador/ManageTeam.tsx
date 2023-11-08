import {
	Grid,
	Box,
	Typography,
	Paper,
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableBody,
	IconButton,
	Button,
	Autocomplete,
	TextField,
} from '@mui/material';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import './ManageTeam.css';

import { useCaTeam } from 'Hooks/CampusAmbassador/useCaTeam';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { maxCaTeamSize } from 'Hooks/CampusAmbassador/constants';
import { StyledTableCell } from './TableCell';

export default function ManageTeam() {
	const { teamId } = useParams();

	const [addingAmbassador, setAddingAmbassador] = useState<boolean>(false);
	const [chosenAmbassadorId, setChosenAmbassadorId] = useState<number>(0);

	const [editingTeamName, setEditingTeamName] = useState<boolean>(false);
	const {
		caTeam,
		fetchCaTeam,
		loading,
		error,
		caList,
		addAmbassador,
		savingAmbassador,
		updateTeamName,
		savingTeamName,
	} = useCaTeam();

	const [newTeamName, setNewTeamName] = useState<string>(caTeam.name);

	const choosableCaList = caList?.filter((CA) => {
		return !CA.caTeamId;
	});

	useEffect(() => {
		fetchCaTeam(Number(teamId));

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [teamId]);

	useEffect(() => {
		setNewTeamName(caTeam.name);
	}, [caTeam]);

	async function addNewAmbassador() {
		await addAmbassador(Number(teamId), chosenAmbassadorId);
		setChosenAmbassadorId(0);
		setAddingAmbassador(false);
	}

	async function saveTeamName() {
		await updateTeamName(Number(teamId), newTeamName);
		setEditingTeamName(false);
	}

	if (loading) {
		return <Typography variant='h5'>Loading...</Typography>;
	}

	if (error) {
		return <Typography variant='h5'>{error}</Typography>;
	}

	function AmbassadorTable() {
		return (
			<TableContainer component={Box}>
				<Table sx={{ width: '100%' }} size='small'>
					<TableHead>
						<TableRow>
							<StyledTableCell colSpan={6}>
								Ambassadors
							</StyledTableCell>
						</TableRow>
						<TableRow>
							<StyledTableCell>Name</StyledTableCell>
							<StyledTableCell>Email</StyledTableCell>
							<StyledTableCell>AmbassadorId</StyledTableCell>
							<StyledTableCell>Bonus Points</StyledTableCell>
							<StyledTableCell>Referral Points</StyledTableCell>
							<StyledTableCell>Remove From Team</StyledTableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{caTeam.ambassadors.map((row) => (
							<TableRow key={row.email}>
								<StyledTableCell component='th' scope='row'>
									{row.name}
								</StyledTableCell>
								<StyledTableCell align='right'>
									{row.email}
								</StyledTableCell>
								<StyledTableCell align='right'>
									{row.ambassadorId}
								</StyledTableCell>
								<StyledTableCell align='right'>
									{row.bonusPoints}
								</StyledTableCell>
								<StyledTableCell align='right'>
									{row.referralPoints}
								</StyledTableCell>
								<StyledTableCell align='right'>
									<IconButton
										aria-label='delete'
										color='error'
										onClick={() => {
											alert('Coming Soon');
										}}
									>
										<RemoveCircleIcon />
									</IconButton>
								</StyledTableCell>
							</TableRow>
						))}
						{!addingAmbassador &&
							caTeam.ambassadors?.length < maxCaTeamSize && (
								<TableRow>
									<StyledTableCell colSpan={6}>
										<Button
											variant='contained'
											startIcon={<AddCircleOutlineIcon />}
											onClick={() => {
												setAddingAmbassador(true);
											}}
										>
											Add Ambassador
										</Button>
									</StyledTableCell>
								</TableRow>
							)}
						{addingAmbassador && (
							<TableRow>
								<StyledTableCell colSpan={4}>
									<Autocomplete
										sx={{ width: '100%' }}
										options={choosableCaList}
										autoHighlight
										getOptionLabel={(option) => option.name}
										onChange={(event, newValue) => {
											if (newValue) {
												setChosenAmbassadorId(
													newValue.ambassadorId
												);
											}
										}}
										disabled={savingAmbassador}
										value={choosableCaList.find((CA) => {
											return (
												CA.ambassadorId ===
												chosenAmbassadorId
											);
										})}
										renderOption={(props, ca) => (
											<Box component='li' {...props}>
												<StyledTableCell
													sx={{
														width: '50%',
														overflow: 'hidden',
													}}
												>
													{ca.name}
												</StyledTableCell>
												<StyledTableCell
													sx={{
														width: '50%',
														overflow: 'hidden',
													}}
												>
													{ca.email}
												</StyledTableCell>
											</Box>
										)}
										renderInput={(params) => (
											<TextField
												{...params}
												label='Choose a Ambassador'
												inputProps={{
													...params.inputProps,
													autoComplete:
														'new-password', // disable autocomplete and autofill
												}}
											/>
										)}
									/>
								</StyledTableCell>
								<StyledTableCell>
									<Button
										variant='contained'
										startIcon={<SaveIcon />}
										onClick={addNewAmbassador}
										disabled={savingAmbassador}
									>
										Save
									</Button>
								</StyledTableCell>
								<StyledTableCell>
									<Button
										variant='contained'
										startIcon={<CancelIcon />}
										onClick={() => {
											setAddingAmbassador(false);
										}}
										disabled={savingAmbassador}
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
			className='ca-team-data-container'
			component={Paper}
			elevation={2}
			borderRadius={0}
		>
			<Grid
				container
				spacing={2}
				justifyContent='center'
				alignItems='center'
				className='ca-team-data-grid'
			>
				<Grid item xs={6}>
					<Typography>Team ID</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{caTeam.id}</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Name</Typography>
				</Grid>
				<Grid
					item
					xs={6}
					sx={{
						display: 'flex',
						justifyContent: 'flex-start',
						alignItems: 'center',
					}}
					container
				>
					{editingTeamName ? (
						<>
							<Grid item xs={8}>
								<TextField
									label='Team Name'
									value={newTeamName}
									onChange={(e) => {
										setNewTeamName(e.target.value);
									}}
								/>
							</Grid>
							<Grid item xs={2}>
								<IconButton
									onClick={saveTeamName}
									disabled={savingTeamName}
								>
									<SaveIcon />
								</IconButton>
							</Grid>
							<Grid item xs={2}>
								<IconButton
									onClick={() => {
										setEditingTeamName(false);
										setNewTeamName(caTeam.name);
									}}
									disabled={savingTeamName}
								>
									<CancelIcon />
								</IconButton>
							</Grid>
						</>
					) : (
						<>
							<Typography
								sx={{ display: 'inline', paddingRight: '10px' }}
							>
								{caTeam?.name}
							</Typography>
							<IconButton
								onClick={() => {
									setEditingTeamName(true);
								}}
							>
								<EditIcon />
							</IconButton>
						</>
					)}
				</Grid>

				<Grid item xs={6}>
					<Typography>Total Bonus Points</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{caTeam.totalBonusPoints}</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>Total Referral Points</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{caTeam.totalRefPoints}</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>Team Capacity</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>
						{caTeam.ambassadors?.length ?? 0}/{maxCaTeamSize}
					</Typography>
				</Grid>

				<Grid item xs={12}>
					<AmbassadorTable />
				</Grid>
			</Grid>
		</Box>
	);
}
