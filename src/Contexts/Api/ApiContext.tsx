import { AxiosInstance } from 'axios';
import { createContext } from 'react';

export type ApiContextType = {
	accessToken: string;
	refreshToken: string;
	setAccessToken: (accessToken: string) => void;
	setRefreshToken: (refreshToken: string) => void;

	axiosAccPrivate: AxiosInstance;
	axiosAccPublic: AxiosInstance;

	axiosEventsPrivate: AxiosInstance;
	axiosEventsPublic: AxiosInstance;

	axiosMerchPrivate: AxiosInstance;
	axiosMerchPublic: AxiosInstance;
};

export const ApiContext = createContext<ApiContextType>({
	accessToken: '',
	refreshToken: '',
	setAccessToken: () => {},
	setRefreshToken: () => {},

	axiosAccPrivate: {} as AxiosInstance,
	axiosAccPublic: {} as AxiosInstance,

	axiosEventsPrivate: {} as AxiosInstance,
	axiosEventsPublic: {} as AxiosInstance,

	axiosMerchPrivate: {} as AxiosInstance,
	axiosMerchPublic: {} as AxiosInstance,
});
