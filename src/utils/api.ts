import axios, { InternalAxiosRequestConfig } from "axios";
import { accBaseUrl } from "./url";

//Get with Access Token
export const getwithAT = async (url: string) => {
  const res = await axiosPrivate.get(url);
  return res.data;
};

//Post with Access Token
export const postwithAT = async (url: string, data: JSON) => {
  const res = await axiosPrivate.post(url, JSON.stringify(data), {
    headers: {
      "Content-type": "application/json",
    },
  });
  return res.data;
};

//Axios with Access Token
const axiosPrivate = axios.create({
  baseURL: accBaseUrl,
  timeout: 5000,
});

//Axios without Access Token
export const axiosPublic = axios.create({
  baseURL: accBaseUrl,
  headers: {
    "Content-type": "application/json-patch+json",
  },
  timeout: 5000,
});

// Attach Access Token to every request
axiosPrivate.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getJwtFromStorage();
    if (token.length > 0) {
      config.headers["Authorization"] = "Bearer " + token;
      return config;
    } else {
      //Clear authorization
      config.headers["Authorization"] = "";
    }
    return config;
  }
);

// Refresh Access Token on expiry
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
        axiosPrivate.defaults.headers.common["Authorization"] =
          "Bearer " + accessToken;
        originalConfig.headers["Authorization"] = "Bearer " + accessToken;

        return axiosPrivate(originalConfig);
      } catch (_error) {
        return Promise.reject(_error);
      }
    }
    return Promise.reject(err);
  }
);

//To refresh the access token
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  const response = await axiosPublic.post(
    "/api/Auth/refresh",
    JSON.stringify({ refreshToken: refreshToken }),
    {
      headers: {
        "Content-type": "application/json",
      },
    }
  );

  const { accessToken, refreshToken: newRefreshToken } = response.data;
  localStorage.setItem("refreshToken", newRefreshToken);
  storeJwtToStorage(accessToken);
  return accessToken;
};

const storeJwtToStorage = (accessToken: string): void => {
  localStorage.setItem("accessToken", accessToken);
};

export const getJwtFromStorage = (): string => {
  const accessToken = localStorage.getItem("accessToken");
  return accessToken ? accessToken : "";
};
