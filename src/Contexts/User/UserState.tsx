import { useEffect, useState } from 'react';
import UserContext, { UserDatatype } from './UserContext';
import { ApiContext } from '../Api/ApiContext';
import { useContext } from 'react';
import jwt_decode from 'jwt-decode';

interface IUserStateProps {
	children: React.ReactNode;
}

function UserState({ children }: IUserStateProps) {
	const { accessToken } = useContext(ApiContext);

	const [userLoading, setUserLoading] = useState<boolean>(true);
	const [userError, setUserError] = useState<string>('');
	const [userData, setUserData] = useState<UserDatatype>({
		loggedIn: false,
		name: '',
		email: '',
		profilePictureUrl: '',
		role: [],
	});

	async function fetchUserData() {
		try {
			setUserLoading(true);
			if (accessToken) {
				const userProfile = jwt_decode<IUserProfile>(accessToken);
				interface IUserProfile {
					user_id: string;
					email: string;
					name: string;
					picture: string;
					role: string[];
				}

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
	}, [accessToken]);

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
