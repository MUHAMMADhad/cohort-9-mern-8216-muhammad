// Auth service talks to the backend.
// The auth service contains functions that make API calls to your Express backend.

import { API_BASE_URL } from "../config/api.js";

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

const request = async (url, body, fallbackMessage) => {
  let response;
  try {
    response = await fetch(url, requestOptions(body));
  } catch (error) {
    throw new Error(`${fallbackMessage}: service unavailable`, {
      cause: error,
    });
  }

  let data = {};
  try {
    data = await response.json();
  } catch (error) {
    if (response.ok) {
      throw new Error(`${fallbackMessage}: invalid server response`, {
        cause: error,
      });
    }
  }

  if (!response.ok) throw new Error(data.message || fallbackMessage);
  return data;
};

export const registerUser = async (userData) => {
  return request(
    `${API_BASE_URL}/auth/register`,
    userData,
    "Registration failed",
  );
};

export const loginUser = async (credentials) => {
  return request(`${API_BASE_URL}/auth/login`, credentials, "Login failed");
};

// ADD THIS EXPORT
export const logoutUser = async () => {
  return request(`${API_BASE_URL}/auth/logout`, undefined, "Logout failed");
};
