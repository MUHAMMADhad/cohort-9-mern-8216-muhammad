import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "../src/pages/Dashboard.jsx";
import { AuthContext } from "../src/context/AuthContext.jsx";
import { deleteNote, getNotes } from "../src/services/noteService.js";

const mockNavigate = jest.fn();
const mockHandleLogout = jest.fn();

jest.mock("../src/services/noteService.js", () => ({
  deleteNote: jest.fn(),
  getNotes: jest.fn(),
}));

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const notes = [
  {
    id: 1,
    title: "Zebra plan",
    content: "Plan the release",
    created_at: "2026-01-01",
    updated_at: "2026-01-02",
  },
  {
    id: 2,
    title: "Alpha idea",
    content: "A new project idea",
    created_at: "2026-01-03",
    updated_at: "2026-01-04",
  },
];

const renderDashboard = (user = { name: "John Doe" }) =>
  render(
    <MemoryRouter>
      <AuthContext.Provider value={{ user, handleLogout: mockHandleLogout }}>
        <Dashboard />
      </AuthContext.Provider>
    </MemoryRouter>,
  );

describe("Dashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getNotes.mockResolvedValue({ notes });
    mockHandleLogout.mockResolvedValue(undefined);
    window.confirm = jest.fn();
  });

  test("loads notes and supports search and title sorting", async () => {
    const user = userEvent.setup();
    renderDashboard();

    expect(await screen.findByText("Zebra plan")).toBeInTheDocument();
    expect(
      screen.getByText("A calm place for John Doe's ideas."),
    ).toBeInTheDocument();
    await user.type(screen.getByRole("searchbox"), "project");
    expect(screen.getByText("Alpha idea")).toBeInTheDocument();
    expect(screen.queryByText("Zebra plan")).not.toBeInTheDocument();

    await user.clear(screen.getByRole("searchbox"));
    await user.selectOptions(screen.getByLabelText("Sort notes"), "title");
    const titles = screen.getAllByRole("heading", { level: 3 });
    expect(titles.map((title) => title.textContent)).toEqual([
      "Alpha idea",
      "Zebra plan",
    ]);
  });

  test("navigates to create and edit routes", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await screen.findByText("Zebra plan");

    await user.click(screen.getByRole("button", { name: "+ New Note" }));
    await user.click(screen.getAllByRole("button", { name: "Edit" })[0]);

    expect(mockNavigate).toHaveBeenNthCalledWith(1, "/notes/new");
    expect(mockNavigate).toHaveBeenNthCalledWith(2, "/notes/2/edit");
  });

  test("deletes a confirmed note", async () => {
    const user = userEvent.setup();
    window.confirm.mockReturnValue(true);
    deleteNote.mockResolvedValueOnce({ success: true });
    renderDashboard();
    await screen.findByText("Zebra plan");

    await user.click(screen.getAllByRole("button", { name: "Delete" })[0]);

    await waitFor(() => expect(deleteNote).toHaveBeenCalledWith(2));
    expect(screen.queryByText("Alpha idea")).not.toBeInTheDocument();
  });

  test("leaves a note when deletion is cancelled and shows deletion errors", async () => {
    const user = userEvent.setup();
    window.confirm.mockReturnValue(false);
    renderDashboard();
    await screen.findByText("Zebra plan");

    await user.click(screen.getAllByRole("button", { name: "Delete" })[0]);
    expect(deleteNote).not.toHaveBeenCalled();

    window.confirm.mockReturnValue(true);
    deleteNote.mockRejectedValueOnce(new Error("Delete failed"));
    await user.click(screen.getAllByRole("button", { name: "Delete" })[0]);
    expect(await screen.findByText("Delete failed")).toBeInTheDocument();
  });

  test("shows loading, fetch errors, and no-match states", async () => {
    let resolveNotes;
    getNotes.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveNotes = resolve;
      }),
    );
    renderDashboard();
    expect(screen.getByText("Loading notes...")).toBeInTheDocument();
    resolveNotes({ notes: [] });
    expect(await screen.findByText("No notes yet")).toBeInTheDocument();

    getNotes.mockRejectedValueOnce(new Error("Fetch failed"));
    renderDashboard();
    expect(await screen.findByText("Fetch failed")).toBeInTheDocument();
  });

  test("opens and closes the profile", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await screen.findByText("Zebra plan");
    await user.click(screen.getByRole("button", { name: "Open user profile" }));
    expect(
      screen.getByRole("dialog", { name: "Your Profile" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close profile" }));
    expect(
      screen.queryByRole("dialog", { name: "Your Profile" }),
    ).not.toBeInTheDocument();
  });

  test("signs out and navigates to login", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await screen.findByText("Zebra plan");

    await user.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => expect(mockHandleLogout).toHaveBeenCalled());
    expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
  });
});
