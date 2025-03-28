import axios from "axios";
import { getEnvironmentConfig } from "../config/environment"; // Adjust path accordingly
import { toast } from "react-toastify";
import {jwtDecode} from "jwt-decode"; // Corrected import
import { useNavigate } from "react-router-dom"; // If redirecting within SPA
import Cookies from "js-cookie";

const { apiUrl } = getEnvironmentConfig();

const axiosInstance = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const getToken = () => Cookies.get("token");

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          Cookies.remove("token");
          toast.error("Session expired, please log in again.");
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("Invalid token:", error);
        Cookies.remove("token");
        toast.error("Invalid session token, please log in again.");
        window.location.href = "/login";
      }
    }
    return config;
  },
  (error) => {
    console.error("Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

const handleAxiosError = (error) => {
  if (error.response) {
    const message = error.response.data?.message ||` Error ${error.response.status}: ${error.response.statusText}`;
    toast.error(message);
    console.error("Server Response Error:", error.response.data);
  } else if (error.request) {
    toast.error("No response received from the server.");
    console.error("No Response Error:", error.request);
  } else {
    toast.error(error.message || "Unknown Error");
    console.error("Request Setup Error:", error.message);
  }
  throw error;
};

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        toast.error("Unauthorized. Please log in again.");
        Cookies.remove("token");
        window.location.href = "/login";
      } else if (status === 403) {
        toast.error("Access forbidden.");
      } else {
        toast.error(error.response.data?.message || "An error occurred.");
      }
    } else if (error.request) {
      toast.error("No response received from the server.");
    } else {
      toast.error(error.message || "Unknown error.");
    }

    console.error("Axios error:", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;