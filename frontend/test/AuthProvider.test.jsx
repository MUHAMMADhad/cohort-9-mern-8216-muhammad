import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "../src/context/AuthProvider";
import { AuthContext } from "../src/context/AuthContext";
import {
  loginUser,
  registerUser,
  logoutUser,
} from "../src/services/authService";

jest.mock("../src/services/authService.js", () => ({
  loginUser: jest.fn(),
  registerUser: jest.fn(),
  logoutUser: jest.fn(),
}));

const TestComponent = () => {
  const { user, authError, handleLogin, handleRegister, handleLogout } =
    React.useContext(AuthContext);

  return (
    <div>
      <div data-testid="user">{user ? user.email : "No user"}</div>

      <div data-testid="error">{authError || "No error"}</div>

      <button
        onClick={() =>
          handleLogin({
            email: "john@example.com",
            password: "password123",
          }).catch(() => {})
        }
      >
        Login
      </button>

      <button
        onClick={() =>
          handleRegister({
            name: "John Doe",
            email: "john@example.com",
            password: "password123",
          }).catch(() => {})
        }
      >
        Register
      </button>

      <button onClick={() => handleLogout().catch(() => {})}>Logout</button>
    </div>
  );
};

describe("AuthProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("starts with no authenticated user", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId("user")).toHaveTextContent("No user");
  });

  test("clears corrupted stored user data", () => {
    localStorage.setItem("user", "not-json");

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId("user")).toHaveTextContent("No user");
    expect(localStorage.getItem("user")).toBeNull();
  });

  test("handles successful login", async () => {
    const user = userEvent.setup();

    const mockUser = {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
    };

    loginUser.mockResolvedValueOnce({
      success: true,
      user: mockUser,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("john@example.com");
    });

    expect(localStorage.getItem("user")).toBe(JSON.stringify(mockUser));
  });

  test("handles login failure", async () => {
    const user = userEvent.setup();

    loginUser.mockRejectedValueOnce(new Error("Invalid email or password"));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent(
        "Invalid email or password",
      );
    });
  });

  test("handles a login response without user data", async () => {
    const user = userEvent.setup();
    loginUser.mockResolvedValueOnce({ success: true });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent(
        "User data missing in login response",
      );
    });
  });

  test("handles successful registration", async () => {
    const user = userEvent.setup();

    registerUser.mockResolvedValueOnce({
      success: true,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      });
    });
  });

  test("reports registration failures", async () => {
    const user = userEvent.setup();
    registerUser.mockRejectedValueOnce(new Error("Registration failed"));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent(
        "Registration failed",
      );
    });
  });

  test("handles logout", async () => {
    const user = userEvent.setup();

    const mockUser = {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
    };

    localStorage.setItem("user", JSON.stringify(mockUser));

    logoutUser.mockResolvedValueOnce({
      success: true,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId("user")).toHaveTextContent("john@example.com");

    await user.click(screen.getByRole("button", { name: "Logout" }));

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("No user");
    });

    expect(localStorage.getItem("user")).toBeNull();
  });

  test("clears the user even when logout fails", async () => {
    const user = userEvent.setup();
    localStorage.setItem("user", JSON.stringify({ email: "john@example.com" }));
    logoutUser.mockRejectedValueOnce(new Error("Logout failed"));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Logout" }));

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("No user");
    });
    expect(localStorage.getItem("user")).toBeNull();
  });
});
