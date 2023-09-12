import axios, { InternalAxiosRequestConfig } from "axios";
import { AccbaseURL as baseURL } from "./url";

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
  baseURL: baseURL,
  timeout: 5000,
});

//Axios without Access Token
// export const axiosPublic = axios.create({
//   baseURL: baseURL,
//   headers: {
//     "Content-type": "application/json-patch+json",
//   },
//   timeout: 5000,
// });

// Attach Access Token to every request
axiosPrivate.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = getJwtFromCookie();
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

  const response = await axios.post(
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
  storeJwtInCookie(accessToken);
  return accessToken;
};

const storeJwtInCookie = (accessToken: string): void => {
  const d = new Date();
  d.setTime(d.getTime() + 15 * 60 * 1000); // cookie expires in 15 minutes from now.
  const expires = "expires=" + d.toUTCString();
  document.cookie = "token=" + accessToken + ";" + expires + ";path=/";
};

export const getJwtFromCookie = (): string => {
  const cookies = document.cookie.split("; ");
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
    if (name === "token") {
      const token = cookie.substring(eqPos + 1);
      return token;
    }
  }
  return "";
};
