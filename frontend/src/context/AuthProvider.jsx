import { useState } from "react";
import { AuthContext } from "./AuthContext";
import { loginUser, registerUser, logoutUser } from "../services/authService";

export const AuthProvider = ({ children }) => {
  const [authError, setAuthError] = useState(null);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  const handleLogin = async (credentials) => {
    try {
      setAuthError(null);
      const res = await loginUser(credentials);

      // Extract user directly from res.user (or fallback to res.data.user)
      const userData = res.user || res.data?.user;

      if (!userData) {
        throw new Error("User data missing in login response");
      }

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      const message = error.message || "Login failed";
      setAuthError(message);
      throw new Error(message, { cause: error });
    }
  };

  const handleRegister = async (userData) => {
    try {
      setAuthError(null);
      await registerUser(userData);
    } catch (error) {
      const message = error.message || "Registration failed";
      setAuthError(message);
      throw new Error(message, { cause: error });
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, handleLogin, handleRegister, handleLogout, authError }}
    >
      {children}
    </AuthContext.Provider>
  );
};
