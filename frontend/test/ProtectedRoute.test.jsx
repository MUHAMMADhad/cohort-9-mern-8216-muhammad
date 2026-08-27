import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthContext } from "../src/context/AuthContext.jsx";
import ProtectedRoute from "../src/components/ProtectedRoute.jsx";

const renderProtectedRoute = (user) => {
  return render(
    <MemoryRouter initialEntries={["/notes"]}>
      <AuthContext.Provider value={{ user }}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/notes" element={<div>Notes Dashboard</div>} />
          </Route>

          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
};

describe("ProtectedRoute", () => {
  test("allows authenticated user to access protected route", () => {
    const user = {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
    };

    renderProtectedRoute(user);

    expect(screen.getByText("Notes Dashboard")).toBeInTheDocument();

    expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
  });

  test("redirects unauthenticated user to login", () => {
    renderProtectedRoute(null);

    expect(screen.getByText("Login Page")).toBeInTheDocument();

    expect(screen.queryByText("Notes Dashboard")).not.toBeInTheDocument();
  });
});
