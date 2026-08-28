import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { AuthCard } from "../src/components/AuthCard.jsx";
import { AuthContext } from "../src/context/AuthContext";

const mockHandleLogin = jest.fn();
const mockHandleRegister = jest.fn();
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderAuthCard = (path = "/login") => {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthContext.Provider
        value={{
          handleLogin: mockHandleLogin,
          handleRegister: mockHandleRegister,
        }}
      >
        <AuthCard />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
};

describe("AuthCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders login form", () => {
    renderAuthCard("/login");

    expect(screen.getByText("NoteNest")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("name@example.com")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();

    expect(screen.queryByText("Full Name")).not.toBeInTheDocument();
  });

  test("renders signup form", () => {
    renderAuthCard("/signup");

    expect(screen.getByText("Create account")).toBeInTheDocument();

    expect(screen.getByText("Full Name")).toBeInTheDocument();

    expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();
  });

  test("allows user to enter login credentials", async () => {
    const user = userEvent.setup();

    renderAuthCard("/login");

    const emailInput = screen.getByPlaceholderText("name@example.com");
    const passwordInput = screen.getByLabelText("Password");

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  test("calls handleLogin with entered credentials", async () => {
    const user = userEvent.setup();

    mockHandleLogin.mockResolvedValueOnce({});

    renderAuthCard("/login");

    await user.type(
      screen.getByPlaceholderText("name@example.com"),
      "test@example.com",
    );

    await user.type(screen.getByLabelText("Password"), "password123");

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(mockHandleLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith("/notes", {
      replace: true,
    });
  });

  test("switches from login to signup", async () => {
    const user = userEvent.setup();

    renderAuthCard("/login");

    await user.click(screen.getByRole("button", { name: "Sign up" }));

    expect(screen.getByText("Create account")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();

    expect(screen.getByText("Full Name")).toBeInTheDocument();
  });

  test("calls handleRegister when signup form is submitted", async () => {
    const user = userEvent.setup();

    mockHandleRegister.mockResolvedValueOnce({});

    renderAuthCard("/signup");

    await user.type(screen.getByPlaceholderText("John Doe"), "John Doe");

    await user.type(
      screen.getByPlaceholderText("name@example.com"),
      "john@example.com",
    );

    await user.type(screen.getByLabelText("Password"), "password123");

    await user.click(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(mockHandleRegister).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      });
    });
  });

  test("displays login error when login fails", async () => {
    const user = userEvent.setup();

    mockHandleLogin.mockRejectedValueOnce(
      new Error("Invalid email or password"),
    );

    renderAuthCard("/login");

    await user.type(
      screen.getByPlaceholderText("name@example.com"),
      "wrong@example.com",
    );

    await user.type(screen.getByLabelText("Password"), "wrongpassword");

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid email or password",
    );
  });

  test("disables submit button while loading", async () => {
    const user = userEvent.setup();

    mockHandleLogin.mockImplementation(() => new Promise(() => {}));

    renderAuthCard("/login");

    await user.type(
      screen.getByPlaceholderText("name@example.com"),
      "test@example.com",
    );

    await user.type(screen.getByLabelText("Password"), "password123");

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(
      screen.getByRole("button", { name: "Please wait..." }),
    ).toBeDisabled();
  });
});
