import {
	Box,
	Button,
	Grid,
	Paper,
	Table,
	TableBody,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './EventRegContainer.css';
import { IRegistration, ITeam } from 'Hooks/Event/registrationTypes';
import EventRegIndividual from './EventRegIndividual/EventRegIndividual';
import { TypeSafeColDef } from 'Hooks/gridColumType';
import { IEvent } from 'Hooks/Event/eventTypes';
import EventRegTeams from './EventRegTeams/EventRegTeams';
import { useNavigate } from 'react-router-dom';
import { StyledTableCell } from 'Components/Commons/TableCell';

export default function EventRegContainer({
	individualRegsLoading,
	eventRegsIndividual,
	regIndividualCols,
	checkInIndividual,

	event,
	institutionMap,

	teamCols,
	eventRegsTeam,
	teamRegsLoading,
}: {
	event: IEvent | undefined;
	institutionMap: Map<number, string>;

	individualRegsLoading: boolean;
	eventRegsIndividual: IRegistration[];
	regIndividualCols: TypeSafeColDef<IRegistration>[];
	checkInIndividual: (registration: IRegistration) => Promise<void>,

	teamCols: TypeSafeColDef<ITeam>[];
	eventRegsTeam: ITeam[];
	teamRegsLoading: boolean;
}) {
	return (
		<Box className='event-reg-wrapper' component={Paper} elevation={2}>
			<ToolBar />
			<br />
			<RegStatistics
				individualRegsLoading={individualRegsLoading}
				eventRegsIndividual={eventRegsIndividual}
				event={event}
				eventRegsTeam={eventRegsTeam}
				teamRegsLoading={teamRegsLoading}
			/>
			<br />
			<Grid
				container
				spacing={2}
				justifyContent='center'
				className='event-reg-table-grid'
			>
				<Grid item xs={12}>
					<Typography variant='h5'>
						Event Registration list (User wise)
					</Typography>
				</Grid>
				<Grid item xs={12} className='event-reg-table-wrapper'>
					<EventRegIndividual
						individualRegsLoading={individualRegsLoading}
						eventRegsIndividual={eventRegsIndividual}
						regIndividualCols={regIndividualCols}
						checkInIndividual={checkInIndividual}
						isTeam={event?.isTeam ?? false}
					/>
				</Grid>
				{event?.isTeam && (
					<>
						<Grid item xs={12}>
							<Typography variant='h5'>
								Event Registration list (Team wise)
							</Typography>
						</Grid>
						<Grid item xs={12} className='event-reg-table-wrapper'>
							<EventRegTeams
								institutionMap={institutionMap}
								teamCols={teamCols}
								eventRegsTeam={eventRegsTeam}
								teamRegsLoading={teamRegsLoading}
							/>
						</Grid>
					</>
				)}
			</Grid>
			<br />
		</Box>
	);
}

function RegStatistics({
	individualRegsLoading,
	eventRegsIndividual,
	event,
	eventRegsTeam,
	teamRegsLoading,
}: {
	event: IEvent | undefined;

	individualRegsLoading: boolean;
	eventRegsIndividual: IRegistration[];

	eventRegsTeam: ITeam[];
	teamRegsLoading: boolean;
}) {
	const regsFromCollegeMap = new Map<string, number>();

	eventRegsIndividual.forEach((reg) => {
		const institutionName = reg.user?.institution;
		if (institutionName) {
			const regsFromInsituteCount =
				regsFromCollegeMap.get(institutionName);

			if (regsFromInsituteCount) {
				regsFromCollegeMap.set(
					institutionName,
					regsFromInsituteCount + 1
				);
			} else {
				regsFromCollegeMap.set(institutionName, 1);
			}
		}
	});

	if (individualRegsLoading || teamRegsLoading) {
		return (
			<Grid
				container
				spacing={2}
				justifyContent='center'
				alignItems='center'
				className='event-reg-statistics-grid'
			>
				<Grid item xs={12}>
					<Typography variant='h5'>Statistics</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>Loading...</Typography>
				</Grid>
			</Grid>
		);
	}

	return (
		<Grid
			container
			spacing={2}
			justifyContent='center'
			alignItems='center'
			className='event-reg-statistics-grid'
		>
			<Grid item xs={12}>
				<Typography variant='h5'>Statistics</Typography>
			</Grid>
			<Grid item xs={3}>
				<Typography>Total Registrations</Typography>
			</Grid>
			<Grid item xs={9}>
				<Typography>{eventRegsIndividual.length}</Typography>
			</Grid>

			{event?.isTeam && (
				<>
					<Grid item xs={3}>
						<Typography>Total Teams</Typography>
					</Grid>
					<Grid item xs={9}>
						<Typography>{eventRegsTeam?.length}</Typography>
					</Grid>
				</>
			)}
			{regsFromCollegeMap.size > 0 && (
				<>
					<Grid item xs={3}>
						<Typography>Institution wise Registrations</Typography>
					</Grid>
					<Grid item xs={9} container>
						<Table size='small'>
							<TableHead>
								<TableRow>
									<StyledTableCell>
										Institution
									</StyledTableCell>
									<StyledTableCell>Count</StyledTableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{Array.from(regsFromCollegeMap).map(
									([college, count]) => (
										<TableRow key={college}>
											<StyledTableCell>
												{college}
											</StyledTableCell>
											<StyledTableCell>
												{count}
											</StyledTableCell>
										</TableRow>
									)
								)}
							</TableBody>
						</Table>
					</Grid>
				</>
			)}
		</Grid>
	);
}

function ToolBar() {
	const navigate = useNavigate();
	return (
		<Box
			className='event-reg-toolbar'
			component={Paper}
			elevation={2}
			borderRadius={0}
			zIndex={5}
		>
			<Button
				variant='contained'
				color='primary'
				startIcon={<ArrowBackIcon />}
				className='toolbutton'
				onClick={() => {
					navigate(-1);
				}}
			>
				Back
			</Button>
			<Box sx={{ flexGrow: 1 }} />
		</Box>
	);
}
