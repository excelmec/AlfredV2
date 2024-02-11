import { createContext } from 'react';

export type UserContextType = {
	userData: UserDatatype;
	userLoading: boolean;
	userError: string;
	logout: () => void;
};

/**
 * User : Normal user
 * Admin : Admin user, ALL permissions
 * CaVolunteer: They can access all Campus Ambassador related pages, 
 * 				including managing ca teams etc
 * Core: TODO: give VIEW access to most statistics pages
 * MerchManage: Can manage everything related to merchandise
 * EventHead: Can view registrations, for ANY event
 * 
 * Special Case: When event heads are created for any event, they are given
 * access to view registrations for THAT event. They have normal 'User' role only
 * but backend checks if they are event heads for the event they are trying to view.
 */
export type UserRoles =
	| 'User'
	| 'Admin'
	| 'CaVolunteer'
	| 'Core'
	| 'MerchManage'
	| 'EventHead';

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
