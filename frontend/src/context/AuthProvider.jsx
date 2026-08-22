import { useState } from "react";
import { AuthContext } from "./AuthContext";
import { loginUser, registerUser, logoutUser } from "../services/authService";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const handleLogin = async (credentials) => {
    const res = await loginUser(credentials);

    // Extract user directly from res.user (or fallback to res.data.user)
    const userData = res.user || res.data?.user;

    if (!userData) {
      throw new Error("User data missing in login response");
    }

    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleRegister = async (userData) => {
    await registerUser(userData);
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
      value={{ user, handleLogin, handleRegister, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
