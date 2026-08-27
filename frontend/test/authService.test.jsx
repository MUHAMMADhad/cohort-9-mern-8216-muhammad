import {
  loginUser,
  logoutUser,
  registerUser,
} from "../src/services/authService.js";

describe("authService", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    Object.defineProperty(document, "cookie", {
      configurable: true,
      value: "csrf_token=auth-token",
    });
  });

  test.each([
    [
      "registers",
      registerUser,
      "/register",
      { name: "Jane" },
      "Registration failed",
    ],
    [
      "logs in",
      loginUser,
      "/login",
      { email: "jane@example.com" },
      "Login failed",
    ],
    ["logs out", logoutUser, "/logout", undefined, "Logout failed"],
  ])("$0 through the auth API", async (_label, service, path, body) => {
    const response = { success: true };
    fetch.mockResolvedValueOnce({ ok: true, json: async () => response });

    await expect(body ? service(body) : service()).resolves.toEqual(response);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/api/v1/auth${path}`),
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        headers: expect.objectContaining({ "X-CSRF-Token": "auth-token" }),
        body: JSON.stringify(body),
      }),
    );
  });

  test("omits the CSRF header when no token exists", async () => {
    Object.defineProperty(document, "cookie", {
      configurable: true,
      value: "",
    });
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    await loginUser({ email: "jane@example.com" });

    expect(fetch.mock.calls[0][1].headers).not.toHaveProperty("X-CSRF-Token");
  });

  test("uses the server error message", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Invalid credentials" }),
    });

    await expect(loginUser({})).rejects.toThrow("Invalid credentials");
  });

  test("handles unavailable and invalid services", async () => {
    fetch.mockRejectedValueOnce(new Error("offline"));
    await expect(logoutUser()).rejects.toThrow(
      "Logout failed: service unavailable",
    );

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error("bad JSON");
      },
    });
    await expect(registerUser({})).rejects.toThrow(
      "Registration failed: invalid server response",
    );
  });
});
