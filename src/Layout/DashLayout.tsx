import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';

import { NavLink, Outlet } from 'react-router-dom';
import './DashLayout.css';
import { Paper } from '@mui/material';

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
				<Avatar>A</Avatar>
			</Box>
			<Box className='dash-body'>
				<Box
					className='dash-sidebar'
					component={Paper}
					elevation={1}
					borderRadius={0}
				>
					<List>
						<ListItemLink
							to='/'
							text='Home'
							icon={<HomeOutlinedIcon />}
						/>
						<ListItemLink
							to='/about'
							text='About'
							icon={<HomeOutlinedIcon />}
						/>
					</List>
				</Box>
				<Box className='dash-content'>
					<Outlet />
				</Box>
			</Box>
		</Box>
	);
}

interface ListItemLinkProps {
	icon?: React.ReactElement;
	text: string;
	to: string;
	disablePadding?: boolean;
}

function ListItemLink(props: ListItemLinkProps) {
	const { icon, text, to, disablePadding = true } = props;

	return (
		<ListItem disablePadding={disablePadding}>
			<ListItemButton
				component={NavLink}
				to={to}
				className='list-item-link'
			>
				<ListItemIcon>{icon}</ListItemIcon>
				<ListItemText primary={text} />
			</ListItemButton>
		</ListItem>
	);
}
