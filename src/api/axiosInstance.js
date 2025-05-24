// src/api/axiosInstance.js
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";
import { router } from "expo-router";
import { API_BASE_URL } from "@env";
console.log("API_BASE_URL for axios instance", API_BASE_URL);

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isRefreshAttempt =
      error.response?.status === 401 &&
      originalRequest.url.endsWith("/token/refresh/") &&
      !originalRequest._retry;

    if (isRefreshAttempt) {
      originalRequest._retry = true;

      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("refresh");
      await SecureStore.deleteItemAsync("user");

      Alert.alert(
        "Logged Out",
        "Your account was signed in on another device. You have been logged out here.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/login"),
          },
        ],
        { cancelable: false }
      );

      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.endsWith("/token/refresh/")
    ) {
      originalRequest._retry = true;

      const refresh = await SecureStore.getItemAsync("refresh");
      if (!refresh) {
        console.warn("No refresh token. Logging out.");
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
          refresh,
        });
        const newAccessToken = response.data.access;

        await SecureStore.setItemAsync("token", newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError.response?.data);
        await SecureStore.deleteItemAsync("token");
        await SecureStore.deleteItemAsync("user");
        await SecureStore.deleteItemAsync("refresh");
        router.replace("/login");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
