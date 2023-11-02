import {
	Avatar,
	Button,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
} from '@mui/material';
import { UserDatatype } from '../../../Contexts/User/UserContext';
import { useState } from 'react';

interface UserLoginAvatarButtonProps {
	userLoading: boolean;
	userData: UserDatatype;
	logout: () => void;
}

export default function UserLoginAvatarButton({
	userLoading,
	userData,
	logout,
}: UserLoginAvatarButtonProps) {
	const authRedirUrl = process.env.REACT_APP_AUTH_REDIR_URL;
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<any>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	if (!authRedirUrl) {
		throw new Error('REACT_APP_AUTH_REDIR_URL not set');
	}

	if (userLoading) {
		return (
			<Button
				variant='contained'
				size='medium'
				disabled
				sx={{ ml: 2, mr: 2 }}
			>
				Loading...
			</Button>
		);
	}

	if (!userData.loggedIn) {
		const currentUrl = new URL(window.location.href);
		const loginUrl = new URL(authRedirUrl);
		loginUrl.searchParams.append('redirect_to', currentUrl.toString());

		return (
			<Button
				variant='contained'
				size='medium'
				sx={{ m: 2 }}
				LinkComponent='a'
				href={loginUrl.toString()}
			>
				Login
			</Button>
		);
	}

	return (
		<List>
			<ListItem onClick={handleClick}>
				<ListItemButton>
					<ListItemIcon>
						<Avatar
							imgProps={{ referrerPolicy: 'no-referrer' }}
							alt={userData.name}
							src={userData.profilePictureUrl}
						/>
					</ListItemIcon>
					<ListItemText primary={userData.name} />
				</ListItemButton>
			</ListItem>
			<Menu
				id='dash-logout-menu'
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				anchorOrigin={{
					vertical: 'top',
					horizontal: 'left',
				}}
				transformOrigin={{
					vertical: 'bottom',
					horizontal: 'left',
				}}
			>
				<MenuItem onClick={logout}>Logout</MenuItem>
			</Menu>
		</List>
	);
}
