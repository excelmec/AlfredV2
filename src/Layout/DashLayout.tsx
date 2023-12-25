import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Outlet } from 'react-router-dom';
import './DashLayout.css';
import { Paper } from '@mui/material';
import Sidebar from '../Components/Dashboard/Sidebar/Sidebar';
import { useState } from 'react';

export default function DashLayout() {
	const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

	return (
		<Box className='dash-wrapper'>
			<Box
				className='dash-header'
				component={Paper}
				elevation={1}
				borderRadius={0}
			>
				<IconButton
					className='dash-menu-icon'
					size='medium'
					onClick={() => {
						setSidebarOpen(!sidebarOpen);
					}}
				>
					{sidebarOpen ? <CloseIcon /> : <MenuIcon />}
				</IconButton>
				<Typography variant='h6' noWrap component='div'>
					Excel Admin Dashboard
				</Typography>
			</Box>
			<Box className='dash-body'>
				<Box className='dash-sidebar-wrapper' data-open={sidebarOpen}>
					<Sidebar />
				</Box>
				<Box
					className='dash-sidebar-overlay'
					data-open={sidebarOpen}
					onClick={() => {
						setSidebarOpen(!sidebarOpen);
					}}
				/>
				<Box className='dash-content'>
					<Outlet />
				</Box>
				<ToastContainer />
			</Box>
		</Box>
	);
}
