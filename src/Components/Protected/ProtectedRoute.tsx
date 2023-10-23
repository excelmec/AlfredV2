import { useContext } from 'react';
import UserContext from '../../Contexts/User/UserContext';
import { Box } from '@mui/material';

interface IProtectedRouteProps {
	children: React.ReactNode;
}

export default function ProtectedRoute(props: IProtectedRouteProps) {
	const { userData, userLoading, userError } = useContext(UserContext);

	if (userLoading) {
		return <Box>Loading...</Box>;
	}

	if (userError) {
		return <Box>{userError}</Box>;
	}

	if (!userData.loggedIn) {
		return <Box>Not logged in</Box>;
	}

	return <>{props.children}</>;
}
