import { refreshAccessToken } from "./apiBase";
import jwt_decode from "jwt-decode";

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