import { Box, Typography } from '@mui/material';
import CreateSchedule from 'Components/Events/EventSchedule/CreateSchedule';
import EventEditToolBar from 'Components/Events/EventSchedule/CreateScheduleToolBar';
import { defaultDummyEvent } from 'Hooks/Event/create-update/eventScheduleValidation';
import lodash from 'lodash';
import { useEffect, useState } from 'react';
import { IValidateCreateEventSchedule } from 'Hooks/Event/create-update/eventScheduleValidation';
import { useScheduleList } from 'Hooks/Event/useScheduleList';

export default function EventScheduleCreate() {
    const {
        newEvent,
        setNewEvent,
        validationErrors,
        createSchedule,
        validateSchedule,
        creatingSchedule,
		error: creatingScheduleError,
    } = useScheduleList();

	const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

	useEffect(() => {
		if (lodash.isEqual(defaultDummyEvent, newEvent)) {
			setHasUnsavedChanges(false);
		} else {
			setHasUnsavedChanges(true);
		}
	}, [newEvent]);

	if (creatingScheduleError) {
		return <Typography variant='h5'>{creatingScheduleError}</Typography>;
	}

	return (
		<>
			<br />
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					width: '100%',
				}}
			>
				<Typography variant='h5' noWrap>
					Add Event Schedule details
				</Typography>
			</Box>
			<br />

			<EventEditToolBar
				saveChanges={createSchedule}
				hasUnsavedChanges={hasUnsavedChanges}
				savingEvent={creatingSchedule}
			/>

			<CreateSchedule
				newEvent={newEvent as IValidateCreateEventSchedule}
				setNewEvent={setNewEvent}
				savingEvent={creatingSchedule}
				savingEventError={creatingScheduleError}
				validateEvent={validateSchedule}
				validationErrors={validationErrors}
			/>
		</>
	);
}
