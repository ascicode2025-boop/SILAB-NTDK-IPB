import axios from "axios";
import { getToken } from "../services/AuthService";

const axiosClient = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api",
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
});

axiosClient.interceptors.request.use(
    (config) => {
        const token = getToken();
        
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosClient;
