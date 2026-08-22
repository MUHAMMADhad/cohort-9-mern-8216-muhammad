import { useState } from "react";
import { AuthContext } from "./AuthContext";
import { loginUser, registerUser } from "../services/authService";

/** @typedef {{ email: string, password: string }} LoginCredentials */
/** @typedef {{ name: string, email: string, password: string }} RegistrationData */
/** @typedef {{ id: number, name: string, email: string }} AuthUser */

/** @param {{ children: import("react").ReactNode }} props */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(/** @type {AuthUser|null} */ (null));
  const [authError, setAuthError] = useState(/** @type {string|null} */ (null));

  /** @param {LoginCredentials} credentials */
  const handleLogin = async (credentials) => {
    try {
      const res = await loginUser(credentials);
      setUser(res.data.user);
      setAuthError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      setAuthError(message);
      throw new Error(message, { cause: error });
    }
  };

  /** @param {RegistrationData} userData */
  const handleRegister = async (userData) => {
    try {
      await registerUser(userData);
      setAuthError(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Registration failed";
      setAuthError(message);
      throw new Error(message, { cause: error });
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, handleLogin, handleRegister, handleLogout, authError }}
    >
      {children}
    </AuthContext.Provider>
  );
};
