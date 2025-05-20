import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_BASE_URL } from "@env";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const loadSession = async () => {
      const token = await SecureStore.getItemAsync("token");
      const user = await SecureStore.getItemAsync("user");
      if (token && user) {
        setToken(token);
        setIsAuthenticated(true);
        const parsedUser = JSON.parse(user);
        setUserData(parsedUser);
        setUserId(parsedUser.id);
      }
    };
    loadSession();
  }, []);

  const refreshToken = async () => {
    try {
      const refresh = await SecureStore.getItemAsync("refresh");
      if (!refresh) throw new Error("No refresh token found");

      const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
        refresh,
      });

      const newAccess = response.data.access;
      await SecureStore.setItemAsync("token", newAccess);
      setToken(newAccess);

      return newAccess;
    } catch (error) {
      console.error(
        "Failed to refresh token:",
        error.response?.data || error.message
      );
      logout(); // Optional: force logout on refresh failure
      return null;
    }
  };

  const authRequest = async (url, method = "get", data = null) => {
    try {
      const response = await axios({
        method,
        url,
        data,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response;
    } catch (err) {
      if (err.response?.status === 401) {
        // Try to refresh the token
        const newToken = await refreshToken();
        if (!newToken) throw err;

        // Retry the request with new token
        const retryResponse = await axios({
          method,
          url,
          data,
          headers: { Authorization: `Bearer ${newToken}` },
        });
        return retryResponse;
      } else {
        throw err;
      }
    }
  };

  const loginUser = async ({ email, password }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/token/`, {
        email,
        password,
      });

      console.log("Login response:", response.data);

      const { access, refresh } = response.data;

      const userResponse = await axios.get(`${API_BASE_URL}/me/`, {
        headers: { Authorization: `Bearer ${access}` },
      });

      // If your backend no longer includes roles or you don’t want to check, you can remove role check here

      await SecureStore.setItemAsync("token", access);
      await SecureStore.setItemAsync("refresh", refresh);
      await SecureStore.setItemAsync("user", JSON.stringify(userResponse.data));

      setToken(access);
      setIsAuthenticated(true);
      setUserData(userResponse.data);
      setUserId(userResponse.data.id);

      return { success: true };
    } catch (error) {
      console.error("LoginUser error:", error.response?.data || error.message);
      return { success: false, error: "Invalid credentials or server error." };
    }
  };

  // LOGOUT clears stored tokens and resets state
  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("refresh");
    await SecureStore.deleteItemAsync("user");
    setIsAuthenticated(false);
    setUserData(null);
    setUserId(null);
  };

  // SIGNUP example - post to /signup/
  const signup = async ({ email, password, idNumber, fullName }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/signup/user/`, {
        email,
        password,
        id_number: idNumber,
        full_name: fullName,
      });

      if (response.status === 201) {
        return { success: true };
      } else {
        return { success: false, error: "Signup failed." };
      }
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      return {
        success: false,
        error: "Unexpected error occurred during signup.",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userData,
        userId,
        token,
        loginUser,
        logout,
        signup,
        authRequest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzQ3NzA1OTU0LCJpYXQiOjE3NDc3MDIzNTQsImp0aSI6ImFhOTBhYjY4MDllNzQyMTJiYjg2MTZmMzE3NjY0YmQ5IiwidXNlcl9pZCI6MjB9.2Z3RZSCZ2BJFojNcUz0F_qRIRNWF0AnFgEV5gufoO5Y

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
