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
import { useContext } from 'react';
import UserContext from '../Contexts/User/UserContext';
import UserLoginAvatarButton from '../Components/Login/UserLoginAvatarButton';

export default function DashLayout() {
	const { userData, userLoading, logout } = useContext(UserContext);

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
						<ListItemLink
							to='/contact'
							text='Contact'
							icon={<HomeOutlinedIcon />}
						/>
					</List>
					<Box sx={{ flexGrow: 1 }}></Box>
					<UserLoginAvatarButton
						userLoading={userLoading}
						userData={userData}
						logout={logout}
					/>
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
