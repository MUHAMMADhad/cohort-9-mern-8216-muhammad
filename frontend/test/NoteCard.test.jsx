import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NoteCard from "../src/components/NoteCard.jsx";

describe("NoteCard", () => {
  test("strips HTML and truncates long content", () => {
    const content = `<strong>${"a".repeat(160)}</strong>`;
    render(
      <NoteCard
        note={{
          id: 3,
          title: "Markup note",
          content,
          created_at: "2026-01-01",
        }}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    const preview = screen.getByText(`${"a".repeat(150)}...`);
    expect(preview).toBeInTheDocument();
    expect(preview.innerHTML).not.toContain("<strong>");
  });

  test("forwards the note id for edit and delete", async () => {
    const user = userEvent.setup();
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    render(
      <NoteCard
        note={{
          id: 8,
          title: "A note",
          content: "Some text",
          created_at: "2026-01-01",
        }}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(onEdit).toHaveBeenCalledWith(8);
    expect(onDelete).toHaveBeenCalledWith(8);
  });
});
