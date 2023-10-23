import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { Outlet } from 'react-router-dom';
import './DashLayout.css';
import { Paper } from '@mui/material';
import Sidebar from '../Components/Dashboard/Sidebar';

export default function DashLayout() {
	return (
		<Box className='dash-wrapper'>
			<Box
				className='dash-header'
				component={Paper}
				elevation={1}
				borderRadius={0}
			>
				<Typography variant='h6' noWrap component='div'>
					Alfred - Excel Admin Dashboard
				</Typography>
			</Box>
			<Box className='dash-body'>
				<Box
					className='dash-sidebar'
					component={Paper}
					elevation={1}
					borderRadius={0}
				>
					<Sidebar />
				</Box>
				<Box className='dash-content'>
					<Outlet />
				</Box>
			</Box>
		</Box>
	);
}
