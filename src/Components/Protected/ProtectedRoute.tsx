import { useContext } from 'react';
import UserContext, { UserRoles } from '../../Contexts/User/UserContext';
import { Typography } from '@mui/material';

interface IProtectedRouteProps {
	children: React.ReactNode;
	allowedRoles?: UserRoles[];
}

export default function ProtectedRoute(props: IProtectedRouteProps) {
	const { userData, userLoading, userError } = useContext(UserContext);

	if (userLoading) {
		return <Typography variant='h5'>Loading...</Typography>;
	}

	if (userError) {
		return <Typography variant='h3'>{userError}</Typography>;
	}

	if (!userData.loggedIn) {
		return <Typography variant='h5'>Not logged in</Typography>;
	}

	console.log(userData.roles);
	if (
		props.allowedRoles &&
		props.allowedRoles.length > 0 &&
		!userData.roles.some((role) => props.allowedRoles?.includes(role))
	) {
		return <Typography variant='h5'>You do not have permission to view this page</Typography>;
	}

	return <>{props.children}</>;
}
