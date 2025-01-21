import { AppError } from "@/utils/AppError";
import axios from "axios";

const api = axios.create({
  baseURL: "http://172.19.150.126:3333",
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.data) {
      return Promise.reject(new AppError(error.response.data.message))
    }

    return Promise.reject(error);
  }
);

export { api };
