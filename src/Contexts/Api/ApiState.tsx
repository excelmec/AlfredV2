import { useCallback, useEffect } from 'react';
import { ApiContext } from './ApiContext';
import { useLocalStorage } from '../../Hooks/useLocalStorage';
import axios, { InternalAxiosRequestConfig } from 'axios';

interface IApiStateProps {
	children: React.ReactNode;
}

export function ApiState({ children }: IApiStateProps) {
	const accBaseUrl = process.env.REACT_APP_ACC_BACKEND_BASE_URL;
	const eventsBaseUrl = process.env.REACT_APP_EVENTS_BACKEND_BASE_URL;

	if (!accBaseUrl) {
		throw new Error('REACT_APP_ACC_BACKEND_BASE_URL is undefined');
	}
	if (!eventsBaseUrl) {
		throw new Error('REACT_APP_EVENTS_BACKEND_BASE_URL is undefined');
	}

	const [refreshToken, setRefreshToken] = useLocalStorage('refreshToken', '');
	const [accessToken, setAccessToken] = useLocalStorage('accessToken', '');

	function checkRefreshFromUrl() {
		const currUrl = new URL(window.location.href);
		let newRefreshToken: string | null =
			currUrl.searchParams.get('refreshToken');
		if (newRefreshToken) {
			setRefreshToken(newRefreshToken);
			currUrl.searchParams.delete('refreshToken');
			window.history.replaceState({}, '', currUrl.toString());
		}
	}

	useEffect(() => {
		checkRefreshFromUrl();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	console.log('Refresh token in state', refreshToken);
	console.log('Access token in state', accessToken);

	const axiosConfig = {
		timeout: 10000,
		headers: {
			'Content-type': 'application/json',
		},
	};
	//Axios with Access Token
	const axiosAccPrivate = axios.create({
		...axiosConfig,
		baseURL: accBaseUrl,
	});

	//Axios without Access Token
	const axiosAccPublic = axios.create({
		...axiosConfig,
		baseURL: accBaseUrl,
	});

	//Axios with Access Token
	const axiosEventsPrivate = axios.create({
		...axiosConfig,
		baseURL: eventsBaseUrl,
	});

	//Axios without Access Token
	const axiosEventsPublic = axios.create({
		...axiosConfig,
		baseURL: eventsBaseUrl,
	});

	async function refreshTheAccessToken(): Promise<string> {
		if (!refreshToken) {
			return '';
		}

		const response = await axiosAccPublic.post(
			'/api/Auth/refresh',
			JSON.stringify({ refreshToken: refreshToken })
		);

		const { accessToken } = response.data;
		setAccessToken(accessToken);
		return accessToken;
	}
	const refreshAccessToken = useCallback(refreshTheAccessToken, [
		refreshToken,
		axiosAccPublic,
		setAccessToken,
	]);

	useEffect(() => {
		refreshAccessToken();
	}, [refreshToken, axiosAccPublic, setAccessToken, refreshAccessToken]);

	const attachAccessToken = (
		config: InternalAxiosRequestConfig
	): InternalAxiosRequestConfig => {
		if (accessToken && accessToken.length > 0) {
			config.headers['Authorization'] = 'Bearer ' + accessToken;
			return config;
		} else {
			//Clear authorization
			config.headers['Authorization'] = '';
		}
		return config;
	};

	axiosAccPrivate.interceptors.request.clear();
	axiosEventsPrivate.interceptors.request.clear();

	/**
	 * Attach Access Token to every request
	 */
	axiosAccPrivate.interceptors.request.use(attachAccessToken);
	axiosEventsPrivate.interceptors.request.use(attachAccessToken);

	axiosAccPrivate.interceptors.response.clear();
	axiosEventsPrivate.interceptors.response.clear();

	const retryWithAt = [
		(res: any) => {
			return res;
		},

		async (err: any) => {
			const originalConfig = err.config;

			if (err.response.status === 401 && !originalConfig._retry) {
				originalConfig._retry = true;

				try {
					axiosAccPrivate.defaults.headers.common['Authorization'] =
						'Bearer ' + accessToken;
					originalConfig.headers['Authorization'] =
						'Bearer ' + accessToken;

					return axiosAccPrivate(originalConfig);
				} catch (_error) {
					return Promise.reject(_error);
				}
			}
			return Promise.reject(err);
		},
	];
	/**
	 * Refresh Access Token on expiry
	 */
	axiosAccPrivate.interceptors.response.use(...retryWithAt);
	axiosEventsPrivate.interceptors.response.use(...retryWithAt);

	return (
		<ApiContext.Provider
			value={{
				accessToken,
				refreshToken,
				setAccessToken,
				setRefreshToken,
				axiosAccPrivate,
				axiosAccPublic,
				axiosEventsPrivate,
				axiosEventsPublic,
			}}
		>
			{children}
		</ApiContext.Provider>
	);
}
