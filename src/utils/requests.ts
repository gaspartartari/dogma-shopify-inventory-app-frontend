import axios, { type AxiosRequestConfig } from "axios";
import { BASE_URL, TOKEN_KEY } from "./system";
import { navigate } from "./navigation";
import qs from "qs";

export function requestBackend(config: AxiosRequestConfig) {

    const headers = config.withCredentials
        ? {
            ...config.headers,
            "authorization": "Bearer " + localStorage.getItem(TOKEN_KEY)
        }
        : config.headers;

    return axios({ 
        ...config, 
        baseURL: BASE_URL, 
        headers,
        paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })
    });
}

// REQUEST INTERCEPTOR
axios.interceptors.request.use(
    function (config) {
        // DO SOMETHING BEFORE REQUEST IS SENT
        return config;
    },
    function (error) {
        // DO SOMETHING WITH REQUEST ERROR
        return Promise.reject(error);
    }
);

// RESPONSE INTERCEPTOR
axios.interceptors.response.use(
    function (response) {
        // DO SOMETHING WITH RESPONSE DATA IF STATUS IS 2xx
        return response;
    },
    function (error) {
        // DO SOMETHING WITH RESPONSE ERROR
        if (error.response.status === 401) {
            navigate("/login");
        } else if (error.response.status === 403) {
            navigate("/login");
        }
        return Promise.reject(error);
    }
);