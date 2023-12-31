import { Box, Button, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';

import './ItemViewToolBar.css';
import { useNavigate } from 'react-router-dom';

export default function ItemViewToolBar({itemId}: {itemId: number}) {
	const navigate = useNavigate();
	return (
		<Box
			className='item-view-toolbar'
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
					navigate('/merch/items');
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
				onClick={()=>{
					navigate(`/merch/items/edit/${itemId}`);
				}}
			>
				Edit
			</Button>
			<Button
				variant='contained'
				color='primary'
				startIcon={<MilitaryTechIcon />}
				className='toolbutton'
			>
				Orders
			</Button>
		</Box>
	);
}
