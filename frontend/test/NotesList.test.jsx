import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotesList from "../src/components/NotesList.jsx";

describe("NotesList", () => {
  test("shows the empty state when there are no notes", () => {
    render(<NotesList notes={[]} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText("No notes yet")).toBeInTheDocument();
    expect(
      screen.getByText("Create your first note to get started."),
    ).toBeInTheDocument();
  });

  test("renders notes and forwards edit and delete actions", async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    render(
      <NotesList
        notes={[
          {
            id: 1,
            title: "First",
            content: "First content",
            created_at: "2026-01-01",
          },
          {
            id: 2,
            title: "Second",
            content: "Second content",
            created_at: "2026-01-02",
          },
        ]}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "Edit" })[1]);
    await user.click(screen.getAllByRole("button", { name: "Delete" })[0]);

    expect(onEdit).toHaveBeenCalledWith(2);
    expect(onDelete).toHaveBeenCalledWith(1);
  });
});
