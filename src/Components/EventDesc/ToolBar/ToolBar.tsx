import { Box, Button, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';

import './ToolBar.css';
import { useNavigate } from 'react-router-dom';

export default function ToolBar() {
	const navigate = useNavigate();
	return (
		<Box
			className='event-desc-toolbar'
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
					navigate('/events');
				}}
			>
				Back
			</Button>
			<Box sx={{ flexGrow: 1 }} />

			<Button
				variant='contained'
				color='primary'
				startIcon={<EditIcon />}
				className='toolbutton'
			>
				Edit
			</Button>
			<Button
				variant='contained'
				color='primary'
				startIcon={<MilitaryTechIcon />}
				className='toolbutton'
			>
				Results
			</Button>
		</Box>
	);
}
