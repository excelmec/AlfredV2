import axios, { InternalAxiosRequestConfig } from 'axios';

const accBaseUrl = process.env.REACT_APP_ACC_BACKEND_BASE_URL;

const axiosConfig = {
	baseURL: accBaseUrl,
	timeout: 10000,
	headers: {
		'Content-type': 'application/json',
	},
};

//Axios with Access Token
const axiosPrivate = axios.create(axiosConfig);

//Axios without Access Token
export const axiosPublic = axios.create(axiosConfig);

/**
 * Get with Access Token
 */
export const getwithAT = async (url: string) => {
	const res = await axiosPrivate.get(url);
	return res.data;
};

/**
 * Post with Access Token
 */
export const postwithAT = async (url: string, data: JSON) => {
	const res = await axiosPrivate.post(url, JSON.stringify(data), {
		headers: {
			'Content-type': 'application/json',
		},
	});
	return res.data;
};

/**
 * Attach Access Token to every request
 */
axiosPrivate.interceptors.request.use(
	(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const accessToken = localStorage.getItem('accessToken');
		if (accessToken && accessToken.length > 0) {
			config.headers['Authorization'] = 'Bearer ' + accessToken;
			return config;
		} else {
			//Clear authorization
			config.headers['Authorization'] = '';
		}
		return config;
	}
);

/**
 * Refresh Access Token on expiry
 */
axiosPrivate.interceptors.response.use(
	(res) => {
		return res;
	},
	async (err) => {
		const originalConfig = err.config;

		if (err.response.status === 401 && !originalConfig._retry) {
			originalConfig._retry = true;

			try {
				const accessToken = await refreshAccessToken();
				axiosPrivate.defaults.headers.common['Authorization'] =
					'Bearer ' + accessToken;
				originalConfig.headers['Authorization'] =
					'Bearer ' + accessToken;

				return axiosPrivate(originalConfig);
			} catch (_error) {
				return Promise.reject(_error);
			}
		}
		return Promise.reject(err);
	}
);

/**
 * To refresh the access token
 */
export const refreshAccessToken = async () => {
	let refreshToken = localStorage.getItem('refreshToken');
	if(refreshToken) {
		refreshToken = refreshToken.replace(/['"]+/g, '');
	}

	const response = await axiosPublic.post(
		'/api/Auth/refresh',
		JSON.stringify({ refreshToken: refreshToken }),
		{
			headers: {
				'Content-type': 'application/json',
			},
		}
	);

	const { accessToken } = response.data;
    localStorage.setItem('accessToken', accessToken);
	return accessToken;
};

