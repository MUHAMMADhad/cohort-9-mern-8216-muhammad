import { createContext } from "react";

/** @typedef {{ email: string, password: string }} LoginCredentials */
/** @typedef {{ name: string, email: string, password: string }} RegistrationData */
/** @typedef {{ id: number, name: string, email: string }} AuthUser */
/** @typedef {{ user: AuthUser|null, handleLogin: (credentials: LoginCredentials) => Promise<void>, handleRegister: (userData: RegistrationData) => Promise<void>, handleLogout: () => Promise<void>, authError: string|null }} AuthContextValue */

/** @type {import("react").Context<AuthContextValue|null>} */
export const AuthContext = createContext(null);
