import { useCallback, useEffect } from 'react';
import { ApiContext } from './ApiContext';
import { useLocalStorage } from '../../Hooks/useLocalStorage';
import axios, { InternalAxiosRequestConfig } from 'axios';

interface IApiStateProps {
  children: React.ReactNode;
}

const accBaseUrl = process.env.REACT_APP_ACC_BACKEND_BASE_URL;
const eventsBaseUrl = process.env.REACT_APP_EVENTS_BACKEND_BASE_URL;
const ticketsBaseUrl = process.env.REACT_APP_TICKETS_BACKEND_BASE_URL;

/**
 * Not setting this will disable the merch API in the dashboard
 */
export const merchBaseUrl = process.env.REACT_APP_MERCH_BACKEND_BASE_URL;

export function ApiState({ children }: IApiStateProps) {
  console.log('ApiState');

  if (!accBaseUrl) {
    throw new Error('REACT_APP_ACC_BACKEND_BASE_URL is undefined');
  }
  if (!eventsBaseUrl) {
    throw new Error('REACT_APP_EVENTS_BACKEND_BASE_URL is undefined');
  }

  /**
   * Alfred can be used without certain features if needed
   * as Alfred is an all-in-one dashboard
   *
   * Newer independent API dash should not throw errors
   * but instead be enabled/disabled based on required features
   */
  if (!merchBaseUrl) {
    console.warn('REACT_APP_MERCH_BACKEND_BASE_URL is undefined');
    console.warn('Merch API will not be available');
    // throw new Error('REACT_APP_MERCH_BACKEND_BASE_URL is undefined');
  }

  const [refreshToken, setRefreshToken] = useLocalStorage('refreshToken', '');
  const [accessToken, setAccessToken] = useLocalStorage('accessToken', '');

  function checkRefreshFromUrl() {
    const currUrl = new URL(window.location.href);
    let newRefreshToken: string | null = currUrl.searchParams.get('refreshToken');
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
    timeout: 40000,
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

  //Axios with Access Token
  const axiosMerchPrivate = axios.create({
    ...axiosConfig,
    baseURL: merchBaseUrl,
  });

  //Axios without Access Token
  const axiosMerchPublic = axios.create({
    ...axiosConfig,
    baseURL: merchBaseUrl,
  });

  //Axios with Access Token
  const axiosTicketsPrivate = axios.create({
    ...axiosConfig,
    baseURL: ticketsBaseUrl,
  });

  async function refreshTheAccessToken(): Promise<string> {
    if (!refreshToken) {
      return '';
    }

    const response = await axiosAccPublic.post(
      '/api/Auth/refresh',
      JSON.stringify({ refreshToken: refreshToken }),
    );

    const { accessToken } = response.data;
    setAccessToken(accessToken);
    return accessToken;
  }
  const refreshAccessToken = useCallback(
    refreshTheAccessToken,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshToken],
  );

  useEffect(() => {
    refreshAccessToken();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshToken]);

  const attachAccessToken = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
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
  axiosMerchPrivate.interceptors.request.clear();
  axiosTicketsPrivate.interceptors.request.clear();

  /**
   * Attach Access Token to every request
   */
  axiosAccPrivate.interceptors.request.use(attachAccessToken);
  axiosEventsPrivate.interceptors.request.use(attachAccessToken);
  axiosMerchPrivate.interceptors.request.use(attachAccessToken);
  axiosTicketsPrivate.interceptors.request.use(attachAccessToken);

  axiosAccPrivate.interceptors.response.clear();
  axiosEventsPrivate.interceptors.response.clear();
  axiosMerchPrivate.interceptors.response.clear();
  axiosTicketsPrivate.interceptors.response.clear();

  const retryWithAt = [
    (res: any) => {
      return res;
    },

    async (err: any) => {
      const originalConfig = err.config;

      if (
        !originalConfig._retry &&
        (err.response?.status === 401 || // For expired token
          err?.code === 'ECONNABORTED') // For cold start timeouts
      ) {
        console.log('Token Expired, Retrying');
        originalConfig._retry = true;

        try {
          const newAccessToken = await refreshAccessToken();
          axiosAccPrivate.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
          originalConfig.headers['Authorization'] = 'Bearer ' + newAccessToken;

          return await axios(originalConfig);
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
  axiosMerchPrivate.interceptors.response.use(...retryWithAt);
  axiosTicketsPrivate.interceptors.response.use(...retryWithAt);

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

        axiosMerchPrivate,
        axiosMerchPublic,

        axiosTicketsPrivate,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
}
