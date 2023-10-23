import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Collapse from '@mui/material/Collapse';

import UserLoginAvatarButton from '../Login/UserLoginAvatarButton';

import ContactsOutlinedIcon from '@mui/icons-material/ContactsOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';

import { NavLink } from 'react-router-dom';
import { useContext, useState } from 'react';
import UserContext from '../../Contexts/User/UserContext';

export default function Sidebar() {
	const { userData, userLoading, logout } = useContext(UserContext);
	const [caOpen, setCaOpen] = useState(false);
	return (
		<>
			<List>
				<ListItemLink to='/' text='Home' icon={<HomeOutlinedIcon />} />
				<ListItemLink
					to='/users'
					text='Users'
					icon={<InfoOutlinedIcon />}
				/>

				<ListItemButton

					component={NavLink}
					to={'/ca'}
					className='list-item-link'
					onClick={() => {
						setCaOpen(!caOpen);
					}}
				>
					<ListItemIcon>
						<CampaignOutlinedIcon />
					</ListItemIcon>
					<ListItemText primary='Campus Ambassador' />
					{caOpen ? <ExpandLess /> : <ExpandMore />}
				</ListItemButton>
				<Collapse in={caOpen} timeout='auto' unmountOnExit>
					<List>
						<ListItemLink to='/ca/list' text='List' pl={2} />
					</List>
				</Collapse>

				<ListItemLink
					to='/contact'
					text='Contact'
					icon={<ContactsOutlinedIcon />}
				/>
			</List>

			<Box sx={{ flexGrow: 1 }}></Box>
			<UserLoginAvatarButton
				userLoading={userLoading}
				userData={userData}
				logout={logout}
			/>
		</>
	);
}

interface ListItemLinkProps {
	icon?: React.ReactElement;
	text: string;
	to: string;
	disablePadding?: boolean;
	pl?: number;
}

function ListItemLink(props: ListItemLinkProps) {
	const { icon, text, to, disablePadding = true, pl = 0 } = props;

	return (
		<ListItem
			disablePadding={disablePadding}
			sx={{
				pl: pl,
			}}
		>
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
