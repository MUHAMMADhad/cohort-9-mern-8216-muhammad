import { useState } from "react";
import { AuthContext } from "./AuthContext";
import { loginUser, registerUser, logoutUser } from "../services/authService";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });
  const [authError, setAuthError] = useState(null);

  const normalizeAuthError = (error, fallbackMessage) =>
    error instanceof Error
      ? error
      : new Error(fallbackMessage, { cause: error });

  const handleLogin = async (credentials) => {
    try {
      const res = await loginUser(credentials);
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setAuthError(null);
    } catch (error) {
      const normalizedError = normalizeAuthError(error, "Login failed");
      setAuthError(normalizedError.message);
      throw normalizedError;
    }
  };

  const handleRegister = async (userData) => {
    try {
      await registerUser(userData);
      setAuthError(null);
    } catch (error) {
      const normalizedError = normalizeAuthError(error, "Registration failed");
      setAuthError(normalizedError.message);
      throw normalizedError;
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setAuthError(null);
    } catch (error) {
      const normalizedError = normalizeAuthError(error, "Logout failed");
      setAuthError(normalizedError.message);
      throw normalizedError;
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
