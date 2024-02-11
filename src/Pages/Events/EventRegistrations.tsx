import { useEventRegList } from 'Hooks/Event/registrations/useEventReg';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import EventRegContainer from 'Components/Events/EventReg/EventRegContainer';
import { Box, Typography } from '@mui/material';

export default function EventRegistrationsListPage() {
	const { eventId: eventIdStr } = useParams<{ eventId: string }>();
	const {
		event,
		eventLoading,
		institutionMap,

		individualRegsLoading,
		eventRegsIndividual,
		regIndividualCols,

		teamCols,
		eventRegsTeam,
		teamRegsLoading,

		error,
		fetchEventRegList,
		setError,
	} = useEventRegList();

	useEffect(() => {
		if (!eventIdStr) {
			setError('Event ID not found');
			return;
		}
		const eventId = parseInt(eventIdStr);
		if (isNaN(eventId)) {
			setError('Invalid Event ID');
			return;
		}

		fetchEventRegList(eventId);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [eventIdStr]);

	if (error) {
		return <Typography variant='h5'>{error}</Typography>;
	}

	if (eventLoading) {
		return <Typography variant='h5'>Loading...</Typography>;
	}

	return (
		<>
			<br />
			<Box>
				<Typography variant='h4' noWrap component='h4'>
					{`Registration list for ${event?.name}`}
				</Typography>
			</Box>
			<br />
			<EventRegContainer
				event={event}
				institutionMap={institutionMap}
				individualRegsLoading={individualRegsLoading}
				eventRegsIndividual={eventRegsIndividual}
				regIndividualCols={regIndividualCols}
				teamCols={teamCols}
				eventRegsTeam={eventRegsTeam}
				teamRegsLoading={teamRegsLoading}
			/>
		</>
	);
}
