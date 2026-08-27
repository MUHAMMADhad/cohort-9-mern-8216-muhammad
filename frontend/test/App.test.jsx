import { render, screen } from "@testing-library/react";
import { AuthContext } from "../src/context/AuthContext.jsx";
import App from "../src/App.jsx";

jest.mock("../src/components/AuthCard.jsx", () => ({
  AuthCard: () => <div>Auth screen</div>,
}));
jest.mock("../src/pages/Dashboard.jsx", () => () => (
  <div>Dashboard screen</div>
));
jest.mock("../src/components/NoteEditor.jsx", () => () => (
  <div>Editor screen</div>
));

const renderApp = (user, path) => {
  window.history.pushState({}, "", path);
  return render(
    <AuthContext.Provider value={{ user }}>
      <App />
    </AuthContext.Provider>,
  );
};

describe("App routes", () => {
  test("renders public auth routes", () => {
    renderApp(null, "/login");
    expect(screen.getByText("Auth screen")).toBeInTheDocument();
  });

  test("protects notes routes from unauthenticated users", () => {
    renderApp(null, "/notes");
    expect(screen.getByText("Auth screen")).toBeInTheDocument();
  });

  test.each(["/notes", "/notes/new", "/notes/12/edit"])(
    "renders protected route %s for authenticated users",
    (path) => {
      renderApp({ id: 1, name: "Jane" }, path);
      expect(
        screen.getByText(
          path === "/notes" ? "Dashboard screen" : "Editor screen",
        ),
      ).toBeInTheDocument();
    },
  );
});
