import { Box, Button, Paper } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import './EventEditToolBar.css';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EventEditToolBar({
	updateEvent,
	hasUnsavedChanges,
	savingEvent,
}: {
	updateEvent: () => void;
	hasUnsavedChanges: boolean;
	savingEvent: boolean;
}) {
	const navigate = useNavigate();

	async function showUnsavedChangesPopup() {
		return window.confirm('You have unsaved changes. Do you want to exit?');
	}

	const handler = (event: BeforeUnloadEvent) => {
		event.preventDefault();
		event.returnValue = '';
	};

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
				onClick={updateEvent}
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
