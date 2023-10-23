import { useEffect, useState } from 'react';
import UserContext, { UserDatatype } from './UserContext';
import { useLocalStorage } from 'usehooks-ts';
import { getUserProfile } from '../../utils/api';

interface IUserStateProps {
	children: React.ReactNode;
}

function UserState({ children }: IUserStateProps) {
	const [refreshToken, setRefreshToken] = useLocalStorage('refreshToken', '');

	console.log('Refresh token in state', refreshToken);

	const [userLoading, setUserLoading] = useState<boolean>(true);
	const [userError, setUserError] = useState<string>('');
	const [userData, setUserData] = useState<UserDatatype>({
		loggedIn: false,
		name: '',
		email: '',
		profilePictureUrl: '',
		role: [],
	});

	function checkRefreshFromUrl() {
		const currUrl = new URL(window.location.href);
		let refreshToken: string | null =
			currUrl.searchParams.get('refreshToken');
		if (refreshToken) {
			setRefreshToken(refreshToken);
			currUrl.searchParams.delete('refreshToken');
			window.history.replaceState({}, '', currUrl.toString());
		}
	}

	useEffect(() => {
		checkRefreshFromUrl();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function fetchUserData() {
		try {
			setUserLoading(true);
			if (refreshToken) {
				console.log(
					'Fetchhing Access token using refresh token',
					refreshToken
				);
				const userProfile = await getUserProfile();

				setUserData((userData) => {
					return {
						...userData,
						email: userProfile.email,
						name: userProfile.name,
						profilePictureUrl: userProfile.picture,
						loggedIn: true,
						role: userProfile.role,
					};
				});
			} else {
				setUserData((userData) => {
					return {
						loggedIn: false,
						name: '',
						email: '',
						profilePictureUrl: '',
						role: [],
					};
				});
			}
		} catch (err) {
			setUserError('Error fetching user data');
			console.log(err);
		} finally {
			setUserLoading(false);
		}
	}

	useEffect(() => {
		fetchUserData();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [refreshToken]);

	function logout() {
		setUserLoading(true);
		setUserData({
			loggedIn: false,
			name: '',
			email: '',
			profilePictureUrl: '',
			role: [],
		});
		setUserError('');
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
		setUserLoading(false);
	}

	return (
		<UserContext.Provider
			value={{ userData, userLoading, userError, logout }}
		>
			{children}
		</UserContext.Provider>
	);
}

export default UserState;
