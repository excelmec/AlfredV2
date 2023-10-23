import { createContext } from 'react';

export type UserContextType = {
	userData: UserDatatype;
	userLoading: boolean;
	userError: string;
	logout: () => void;
};

export type UserDatatype = {
	loggedIn: boolean;
	name: string;
	email: string;
	profilePictureUrl: string;
	role: string[];
};

const UserContext = createContext<UserContextType>({
	userData: {
		loggedIn: false,
		name: '',
		email: '',
		profilePictureUrl: '',
		role: [],
	},
	userLoading: true,
	userError: '',
	logout: () => {},
});

export default UserContext;
