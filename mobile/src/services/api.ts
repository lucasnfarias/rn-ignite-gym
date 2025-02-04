import {
  storageAuthTokenGet,
  storageAuthTokenSave,
} from "@/storage/storageAuthToken";
import { AppError } from "@/utils/AppError";
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

type SignOut = () => void;

type PromiseType = {
  onSuccess: (token: string) => void;
  onFailure: (error: AxiosError) => void;
};

type APIInstance = AxiosInstance & {
  registerInterceptTokenManager: (signOut: SignOut) => () => void;
};

const api = axios.create({
  baseURL: "http://172.19.150.126:3333",
}) as APIInstance;

let failedQueue: PromiseType[] = [];
let isRefreshing = false;

api.registerInterceptTokenManager = (signOut) => {
  const interceptTokenManager = api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (requestError) => {
      if (requestError?.response?.status === 401) {
        if (
          ["token.expired", "token.invalid"].includes(
            requestError.response.data?.message
          )
        ) {
          const { token } = await storageAuthTokenGet();

          if (!token) {
            signOut();
            return Promise.reject(requestError);
          }

          const originalRequestConfig =
            requestError.config as AxiosRequestConfig;

          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({
                onSuccess(token) {
                  originalRequestConfig.headers = {
                    Authorization: `Bearer ${token}`,
                  };

                  resolve(api(originalRequestConfig));
                },
                onFailure(error) {
                  reject(error);
                },
              });
            });
          }

          isRefreshing = true;

          return new Promise(async (resolve, reject) => {
            try {
              const { data } = await api.post("/sessions/refresh-token", {
                token,
              });

              await storageAuthTokenSave({
                token: data.token,
                refresh_token: data.refresh,
              });

              if (originalRequestConfig.data) {
                originalRequestConfig.data = JSON.parse(
                  originalRequestConfig.data
                );
              }

              originalRequestConfig.headers = {
                Authorization: `Bearer ${data.token}`,
              };
              api.defaults.headers.common[
                "Authorization"
              ] = `Bearer ${data.token}`;

              failedQueue.forEach((request) => {
                request.onSuccess(data.token);
              });

              resolve(api(originalRequestConfig));
            } catch (error: any) {
              failedQueue.forEach((request) => {
                request.onFailure(error);
              });

              signOut();
              reject(error);
            } finally {
              isRefreshing = false;
              failedQueue = [];
            }
          });
        }

        signOut();
      }

      if (requestError.response && requestError.response.data) {
        return Promise.reject(new AppError(requestError.response.data.message));
      }

      return Promise.reject(requestError);
    }
  );

  return () => api.interceptors.response.eject(interceptTokenManager);
};

export { api };
