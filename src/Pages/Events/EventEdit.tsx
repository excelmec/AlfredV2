import { Box, Typography } from '@mui/material';
import EventEdit from 'Components/EventEdit/EventEdit/EventEdit';
import EventEditToolBar from 'Components/EventEdit/ToolBar/EventEditToolBar';
import { useEventDesc } from 'Hooks/Event/useEventDesc';
import { useEventEdit } from 'Hooks/Event/useEventEdit';
import axios from 'axios';
import lodash from 'lodash';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function EventEditPage() {
	const { event, fetchEvent, loading, error, setError } = useEventDesc();
	const {
		newEvent,
		setNewEvent,
		updateEvent,
		loading: savingEvent,
		error: savingEventError,
		validateEvent,
		validationErrors,
	} = useEventEdit();
	const { id } = useParams<{ id: string }>();

	const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
	const [currentIconFile, setCurrentIconFile] = useState<File | undefined>();

	useEffect(() => {
		if (!Number.isInteger(Number(id))) {
			setError('Invalid Event ID');
		}

		fetchEvent(Number(id));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function initNewEvent() {
		if (!event) return;

		const imageRes = await axios.get(event.icon, {
			responseType: 'blob',
		});

		const icon = new File([imageRes.data], 'icon.png', {
			type: imageRes.headers['content-type'] ?? 'image/png',
		});

		setNewEvent({
			...event,
			icon,
		});

		setCurrentIconFile(icon);
	}

	useEffect(() => {
		if (!event) return;

		initNewEvent();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [event]);

	useEffect(() => {
		if (!currentIconFile) {
			/**
			 * The new and old event loading completes when the icon of old event loads as a file
			 * Else this will falsely trigger the event changed
			 */
			return;
		}

		const oldEvent = {
			...event,
			icon: currentIconFile,
		};

		if (lodash.isEqual(oldEvent, newEvent)) {
			setHasUnsavedChanges(false);
		} else {
			setHasUnsavedChanges(true);
		}
	}, [newEvent, currentIconFile, event]);

	if (error) {
		return <Typography variant='h5'>{error}</Typography>;
	}

	if (loading) {
		return <Typography variant='h5'>Loading...</Typography>;
	}

	if (!event) {
		return (
			<Typography variant='h5'>{'Something went wrong :('}</Typography>
		);
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
					Edit Event
				</Typography>
			</Box>
			<br />

			<EventEditToolBar
				updateEvent={updateEvent}
				hasUnsavedChanges={hasUnsavedChanges}
				savingEvent={savingEvent}
				eventId={event.id}
			/>

			<EventEdit
				newEvent={newEvent!}
				setNewEvent={setNewEvent}
				savingEvent={savingEvent}
				savingEventError={savingEventError}
				validateEvent={validateEvent}
				validationErrors={validationErrors}
			/>
		</>
	);
}
