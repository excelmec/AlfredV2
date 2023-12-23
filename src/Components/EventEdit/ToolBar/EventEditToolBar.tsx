import { Box, Button, Paper } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

import './EventEditToolBar.css';
// import { useNavigate } from 'react-router-dom';

export default function EventEditToolBar() {
	// const navigate = useNavigate();
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
			>
				Save
			</Button>
			<Button
				variant='contained'
				color='error'
				startIcon={<CancelIcon />}
				className='toolbutton'
			>
				Cancel
			</Button>
		</Box>
	);
}
