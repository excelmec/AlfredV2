import { Box, Typography } from '@mui/material';
import EventEdit from 'Components/Events/EventCreateUpdate/EventEdit/EventEdit';
import EventEditToolBar from 'Components/Events/EventCreateUpdate/ToolBar/EventEditToolBar';
import { defaultDummyEvent } from 'Hooks/Event/create-update/eventValidation';
import { useEventCreate } from 'Hooks/Event/create-update/useEventCreate';
import lodash from 'lodash';
import { useEffect, useState } from 'react';

export default function EventCreatePage() {

	const {
		newEvent,
		setNewEvent,
		createEvent,
		loading: creatingEvent,
		error: creatingEventError,
		validateEvent,
		validationErrors,
	} = useEventCreate();

	const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
	// const [currentIconFile, setCurrentIconFile] = useState<File | undefined>();

	// async function initNewEvent() {
	// 	if (!event) return;

	// 	const imageRes = await axios.get(event.icon, {
	// 		responseType: 'blob',
	// 	});

	// 	const icon = new File([imageRes.data], 'icon.png', {
	// 		type: imageRes.headers['content-type'] ?? 'image/png',
	// 	});

	// 	setNewEvent({
	// 		...event,
	// 		icon,
	// 	});

	// 	setCurrentIconFile(icon);
	// }

	// useEffect(() => {
	// 	if (!event) return;

	// 	initNewEvent();
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [event]);

	useEffect(() => {

		if (lodash.isEqual(defaultDummyEvent, newEvent)) {
			setHasUnsavedChanges(false);
		} else {
			setHasUnsavedChanges(true);
		}
	}, [newEvent]);

	if (creatingEventError) {
		return <Typography variant='h5'>{creatingEventError}</Typography>;
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
					Create New Event
				</Typography>
			</Box>
			<br />

			<EventEditToolBar
				saveChanges={createEvent}
				hasUnsavedChanges={hasUnsavedChanges}
				savingEvent={creatingEvent}
			/>

			<EventEdit
				newEvent={newEvent!}
				setNewEvent={setNewEvent}
				savingEvent={creatingEvent}
				savingEventError={creatingEventError}
				validateEvent={validateEvent}
				validationErrors={validationErrors}
			/>
		</>
	);
}
