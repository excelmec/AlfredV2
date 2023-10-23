import { getEventswithAT, refreshAccessToken } from './apiBase';
import jwt_decode from 'jwt-decode';

interface UserProfile {
	user_id: string;
	email: string;
	name: string;
	picture: string;
	role: string[];
}
export async function getUserProfile() {
	const accessToken = await refreshAccessToken();
	const userInfo = jwt_decode(accessToken);
	return userInfo as UserProfile;
}

export interface CA {
	ambassadorId: number;
	caTeamId: number | null;
	email: string;
	image: string;
	name: string;
	referralPoints: number;
	bonusPoints: number;
	totalPoints: number;
}

export async function getCaList() {
	const caList: CA[] = await getEventswithAT('/api/ambassadors/list');
	return caList;
}
