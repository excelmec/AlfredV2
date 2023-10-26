// import axios, { InternalAxiosRequestConfig } from 'axios';

// const accBaseUrl = process.env.REACT_APP_ACC_BACKEND_BASE_URL;
// const eventsBaseUrl = process.env.REACT_APP_EVENTS_BACKEND_BASE_URL;

// if (!accBaseUrl) {
// 	throw new Error('REACT_APP_ACC_BACKEND_BASE_URL is undefined');
// }
// if (!eventsBaseUrl) {
// 	throw new Error('REACT_APP_EVENTS_BACKEND_BASE_URL is undefined');
// }

// const axiosConfig = {
// 	timeout: 10000,
// 	headers: {
// 		'Content-type': 'application/json',
// 	},
// };

// //Axios with Access Token
// const axiosAccPrivate = axios.create({
// 	...axiosConfig,
// 	baseURL: accBaseUrl,
// });

// //Axios without Access Token
// export const axiosAccPublic = axios.create({
// 	...axiosConfig,
// 	baseURL: accBaseUrl,
// });

// //Axios with Access Token
// const axiosEventsPrivate = axios.create({
// 	...axiosConfig,
// 	baseURL: eventsBaseUrl,
// });

// //Axios without Access Token
// export const axiosEventsPublic = axios.create({
// 	...axiosConfig,
// 	baseURL: eventsBaseUrl,
// });

// /**
//  * Get with Access Token
//  */
// export const getAccwithAT = async (url: string) => {
// 	const res = await axiosAccPrivate.get(url);
// 	return res.data;
// };

// /**
//  * Get with Access Token
//  */
// export const getEventswithAT = async (url: string) => {
// 	const res = await axiosEventsPrivate.get(url);
// 	return res.data;
// };

// /**
//  * Post with Access Token
//  */
// export const postAccwithAT = async (url: string, data: JSON) => {
// 	const res = await axiosAccPrivate.post(url, JSON.stringify(data), {
// 		headers: {
// 			'Content-type': 'application/json',
// 		},
// 	});
// 	return res.data;
// };
// /**
//  * Post with Access Token
//  */
// export const postEventswithAT = async (url: string, data: JSON) => {
// 	const res = await axiosEventsPrivate.post(url, JSON.stringify(data), {
// 		headers: {
// 			'Content-type': 'application/json',
// 		},
// 	});
// 	return res.data;
// };

// const attachAccessToken = (
// 	config: InternalAxiosRequestConfig
// ): InternalAxiosRequestConfig => {
// 	const accessToken = localStorage.getItem('accessToken');
// 	if (accessToken && accessToken.length > 0) {
// 		config.headers['Authorization'] = 'Bearer ' + accessToken;
// 		return config;
// 	} else {
// 		//Clear authorization
// 		config.headers['Authorization'] = '';
// 	}
// 	return config;
// };
// /**
//  * Attach Access Token to every request
//  */
// axiosAccPrivate.interceptors.request.use(attachAccessToken);
// axiosEventsPrivate.interceptors.request.use(attachAccessToken);

// const retryWithAt = [
// 	(res: any) => {
// 		return res;
// 	},

// 	async (err: any) => {
// 		const originalConfig = err.config;

// 		if (err.response.status === 401 && !originalConfig._retry) {
// 			originalConfig._retry = true;

// 			try {
// 				const accessToken = await refreshAccessToken();
// 				axiosAccPrivate.defaults.headers.common['Authorization'] =
// 					'Bearer ' + accessToken;
// 				originalConfig.headers['Authorization'] =
// 					'Bearer ' + accessToken;

// 				return axiosAccPrivate(originalConfig);
// 			} catch (_error) {
// 				return Promise.reject(_error);
// 			}
// 		}
// 		return Promise.reject(err);
// 	},
// ];

// /**
//  * Refresh Access Token on expiry
//  */
// axiosAccPrivate.interceptors.response.use(...retryWithAt);
// axiosEventsPrivate.interceptors.response.use(...retryWithAt);

// /**
//  * To refresh the access token
//  */
// export const refreshAccessToken = async () => {
// 	let refreshToken = localStorage.getItem('refreshToken');
// 	if (refreshToken) {
// 		refreshToken = refreshToken.replace(/['"]+/g, '');
// 	}

// 	const response = await axiosAccPublic.post(
// 		'/api/Auth/refresh',
// 		JSON.stringify({ refreshToken: refreshToken }),
// 		{
// 			headers: {
// 				'Content-type': 'application/json',
// 			},
// 		}
// 	);

// 	const { accessToken } = response.data;
// 	localStorage.setItem('accessToken', accessToken);
// 	return accessToken;
// };

/**
 * This file is not used in the project
 */
export {};