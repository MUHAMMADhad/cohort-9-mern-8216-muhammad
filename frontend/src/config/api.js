const apiUrl = import.meta.env.VITE_API_URL?.trim();

if (!apiUrl) {
  throw new Error("VITE_API_URL must be defined for the frontend build");
}

export const API_BASE_URL = `${apiUrl}/api/v1`;
