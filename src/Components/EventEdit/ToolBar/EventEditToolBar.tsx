import { Box, Button, Paper } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import './EventEditToolBar.css';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { TupdateFnReturn } from 'Hooks/errorParser';

export default function EventEditToolBar({
	updateEvent,
	hasUnsavedChanges,
	savingEvent,
	eventId,
}: {
	updateEvent: () => Promise<TupdateFnReturn>;
	hasUnsavedChanges: boolean;
	savingEvent: boolean;
	eventId: number;
}) {
	const navigate = useNavigate();

	async function showUnsavedChangesPopup() {
		return window.confirm('You have unsaved changes. Do you want to exit?');
	}

	const handler = (event: BeforeUnloadEvent) => {
		event.preventDefault();
		event.returnValue = '';
	};

	async function saveEvent() {
		try {
			const res = await updateEvent();

			if (res.success) {
				toast.success('Event Saved.');
				navigate(`/events/view/${eventId}`, {
					replace: true,
				});
				return;
			}

			if (res.validationError) {
				toast.error('Please fix the errors to continue.');

				const firstErrorName = res.validationError[0]?.path;
				if (!firstErrorName) return;

				const firstErrorElem =
					document.getElementsByName(firstErrorName)[0];

				if (!firstErrorElem) return;

				firstErrorElem.scrollIntoView({
					behavior: 'smooth',
					block: 'start',
				});

				return;
			}
		} catch (error: any) {
			console.log(error);
			toast.error(`Error saving event: ${error?.message}`);
		}
	}

	useEffect(() => {
		if (hasUnsavedChanges) {
			window.addEventListener('beforeunload', handler);
		} else {
			window.removeEventListener('beforeunload', handler);
		}

		return () => {
			window.removeEventListener('beforeunload', handler);
		};
	}, [hasUnsavedChanges]);

	return (
		<Box
			className='event-edit-toolbar'
			component={Paper}
			elevation={2}
			borderRadius={0}
			zIndex={5}
		>
			<Box sx={{ flexGrow: 1 }} />

			<Button
				variant='contained'
				color='secondary'
				startIcon={<SaveIcon />}
				className='toolbutton'
				onClick={saveEvent}
				disabled={savingEvent}
			>
				{savingEvent ? 'Saving...' : 'Save'}
			</Button>
			<Button
				variant='contained'
				color='error'
				startIcon={<CancelIcon />}
				className='toolbutton'
				disabled={savingEvent}
				onClick={async () => {
					if (hasUnsavedChanges) {
						const confirmExit = await showUnsavedChangesPopup();
						console.log(confirmExit);
						if (!confirmExit) return;
					}

					console.log('navigating');
					navigate(-1);
				}}
			>
				Cancel
			</Button>
		</Box>
	);
}
