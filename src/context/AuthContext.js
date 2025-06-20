import { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_BASE_URL } from "@env";
console.log("API_BASE_URL", API_BASE_URL);

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

  useEffect(() => {
    const interval = setInterval(() => {
      if (token) {
        axios
          .post(
            `${API_BASE_URL}/update-last-seen/`,
            { device_type: "mobile" },
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .catch((err) => console.log("Last seen update error", err));
      }
    }, 300000);

    return () => clearInterval(interval);
  }, [token]);

  const loginUser = async ({ email, password }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/token/mobile/`, {
        email,
        password,
      });

      console.log("Login response:", response.data);

      const { access, refresh } = response.data;

      const userResponse = await axios.get(`${API_BASE_URL}/me/`, {
        headers: { Authorization: `Bearer ${access}` },
      });

      await axios
        .post(
          `${API_BASE_URL}/update-last-seen/`,
          { device_type: "mobile" },
          {
            headers: { Authorization: `Bearer ${access}` },
          }
        )
        .then((res) => console.log("Last seen updated:", res.data))
        .catch((err) =>
          console.log(
            "Last seen update error",
            err.response?.data || err.message
          )
        );

      await SecureStore.setItemAsync("token", access);
      await SecureStore.setItemAsync("refresh", refresh);
      await SecureStore.setItemAsync("user", JSON.stringify(userResponse.data));

      setToken(access);
      setIsAuthenticated(true);
      setUserData(userResponse.data);
      setUserId(userResponse.data.id);

      return { success: true };
    } catch (error) {
      console.log("LoginUser error:", error.response?.data || error.message);
      return {
        success: false,
        error: "Invalid email or password.",
      };
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("refresh");
    await SecureStore.deleteItemAsync("user");
    setIsAuthenticated(false);
    setUserData(null);
    setToken(null);
    setUserId(null);
  };

  const signup = async ({ fullName, email, password, idNumber }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/signup/user/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
          id_number: idNumber,
        }),
      });

      if (response.ok) {
        return { success: true };
      } else {
        const errorData = await response.json();
        console.log("Signup failed:", errorData);
        return {
          success: false,
          error: errorData?.detail || "Signup failed",
        };
      }
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: "Network or server error" };
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
