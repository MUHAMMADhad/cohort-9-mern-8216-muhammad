// Auth service talks to the backend.
// The auth service contains functions that make API calls to your Express backend.

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1/auth`;

const getCsrfToken = () =>
  document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("csrf_token="))
    ?.split("=")[1];

const requestOptions = (body) => ({
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    ...(getCsrfToken() ? { "X-CSRF-Token": getCsrfToken() } : {}),
  },
  credentials: "include",
  body: JSON.stringify(body),
});

export const registerUser = async (userData) => {
  try {
    const response = await fetch(
      `${API_URL}/register`,
      requestOptions(userData),
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Registration failed");
    return data;
  } catch (error) {
    if (error instanceof Error && error.message !== "Failed to fetch")
      throw error;
    throw new Error("Registration service unavailable", { cause: error });
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await fetch(
      `${API_URL}/login`,
      requestOptions(credentials),
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Login failed");
    return data;
  } catch (error) {
    if (error instanceof Error && error.message !== "Failed to fetch")
      throw error;
    throw new Error("Login service unavailable", { cause: error });
  }
};

// ADD THIS EXPORT
export const logoutUser = async () => {
  try {
    const response = await fetch(`${API_URL}/logout`, requestOptions());
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Logout failed");
    return data;
  } catch (error) {
    if (error instanceof Error && error.message !== "Failed to fetch")
      throw error;
    throw new Error("Logout service unavailable", { cause: error });
  }
};
