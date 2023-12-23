import { Grid, Box, Typography, Paper, Divider } from '@mui/material';
import { IEvent } from '../../../Hooks/Event/eventTypes';

import './EventData.css';

export default function EventData({ event }: { event: IEvent }) {
	return (
		<Box
			className='event-data-container'
			component={Paper}
			elevation={1}
			borderRadius={0}
		>
			<Grid
				container
				spacing={2}
				justifyContent='center'
				alignItems='center'
				className='event-data-grid'
			>
				<Grid item xs={12}>
					<Typography variant='h5'>Event Basic Details</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>ID</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{event.id}</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Name</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{event?.name}</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Icon</Typography>
				</Grid>
				<Grid item xs={6}>
					{event?.icon ? (
						<img
							src={event?.icon}
							referrerPolicy='no-referrer'
							style={{
								maxWidth: '70px',
								maxHeight: '70px',
								objectFit: 'contain',
							}}
							alt='Event Logo'
						/>
					) : (
						<Typography>No Icon Uploaded</Typography>
					)}
				</Grid>

				<Grid item xs={6}>
					<Typography>Event Type</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{event?.eventType}</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Event Category</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{event?.category}</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Event Venue</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{event?.venue}</Typography>
				</Grid>

				<Grid item xs={12}>
					<Divider />
				</Grid>
				<Grid item xs={12}>
					<Typography variant='h5'>Event Timeline Details</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Event Day</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>
						{event?.day !== undefined && event?.day !== null
							? event?.day
							: 'Not Specified'}
					</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Event DateTime</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>
						{event?.datetime.toLocaleString([], {
							year: '2-digit',
							month: 'numeric',
							day: 'numeric',
							hour: 'numeric',
							minute: 'numeric',
						})}
					</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>Event Status</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{event?.eventStatus}</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Number of Rounds</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{event?.numberOfRounds}</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Current Round</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{event?.currentRound}</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Registrations Open?</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>
						{event?.registrationOpen ? 'YES' : 'NO'}
					</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Registrations End DateTime</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>
						{event?.registrationEndDate?.toLocaleString([], {
							year: '2-digit',
							month: 'numeric',
							day: 'numeric',
							hour: 'numeric',
							minute: 'numeric',
						})}
					</Typography>
				</Grid>

				<Grid item xs={12}>
					<Divider />
				</Grid>
				<Grid item xs={12}>
					<Typography variant='h5'>Event Prize and Fee</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>Entry Fee</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{event?.entryFee}</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Prize Money</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{event?.prizeMoney}</Typography>
				</Grid>

				<Grid item xs={12}>
					<Divider />
				</Grid>
				<Grid item xs={12}>
					<Typography variant='h5'>Event Heads Details</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Event Head 1</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{event?.eventHead1?.name}</Typography>
					<Typography>{event?.eventHead1?.phoneNumber}</Typography>
					<Typography>{event?.eventHead1?.email}</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Event Head 2</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{event?.eventHead2?.name}</Typography>
					<Typography>{event?.eventHead2?.phoneNumber}</Typography>
					<Typography>{event?.eventHead2?.email}</Typography>
				</Grid>

				<Grid item xs={12}>
					<Divider />
				</Grid>
				<Grid item xs={12}>
					<Typography variant='h5'>
						Event Registration Details
					</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Needs Registration?</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>
						{event?.needRegistration ? 'YES' : 'NO'}
					</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Is Team?</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{event?.isTeam ? 'YES' : 'NO'}</Typography>
				</Grid>

				{event?.isTeam && (
					<>
						<Grid item xs={6}>
							<Typography>Team Size</Typography>
						</Grid>
						<Grid item xs={6}>
							<Typography>{event?.teamSize}</Typography>
						</Grid>
					</>
				)}

				<Grid item xs={6}>
					<Typography>Register Button</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{event?.button}</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Registration Link</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{event?.registrationLink}</Typography>
				</Grid>

				<Grid item xs={12}>
					<Divider />
				</Grid>
				<Grid item xs={12}>
					<Typography variant='h5'>
						Event Information Details
					</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>About</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{event?.about}</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Format</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{event?.format}</Typography>
				</Grid>

				<Grid item xs={6}>
					<Typography>Rules</Typography>
				</Grid>
				<Grid item xs={6}>
					<Typography>{event?.rules}</Typography>
				</Grid>
			</Grid>
		</Box>
	);
}
