import { createContext } from 'react';

export type UserContextType = {
	userData: UserDatatype;
	userLoading: boolean;
	userError: string;
	logout: () => void;
};

export type UserRoles = 'User' | 'Admin' | 'CaVolunteer' | 'Core';

export type UserDatatype = {
	loggedIn: boolean;
	name: string;
	email: string;
	profilePictureUrl: string;
	roles: UserRoles[];
};

const UserContext = createContext<UserContextType>({
	userData: {
		loggedIn: false,
		name: '',
		email: '',
		profilePictureUrl: '',
		roles: [],
	},
	userLoading: true,
	userError: '',
	logout: () => {},
});

export default UserContext;
