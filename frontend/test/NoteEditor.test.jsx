import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NoteEditor from "../src/components/NoteEditor.jsx";
import {
  createNote,
  getNote,
  updateNote,
} from "../src/services/noteService.js";

const mockNavigate = jest.fn();
const mockUseParams = jest.fn(() => ({}));

// Mock BlockNote components and hooks
const mockEditor = {
  document: [{ type: "paragraph", content: [] }],
  replaceBlocks: jest.fn((oldBlocks, newBlocks) => {
    // Actually update the document when replaceBlocks is called
    mockEditor.document = newBlocks;
  }),
};

jest.mock("@blocknote/react", () => ({
  useCreateBlockNote: jest.fn(() => mockEditor),
}));

jest.mock("@blocknote/mantine", () => ({
  BlockNoteView: ({ onChange }) => {
    // Mock component that allows testing through onChange
    return (
      <div data-testid="blocknote-editor" onChange={onChange}>
        <input
          data-testid="content-input"
          type="text"
          aria-label="Content"
          onChange={(e) => {
            // Simulate editor document update
            mockEditor.document = [
              {
                type: "paragraph",
                content: [{ type: "text", text: e.target.value, styles: {} }],
              },
            ];
            onChange?.();
          }}
        />
      </div>
    );
  },
}));

jest.mock("../src/services/noteService.js", () => ({
  createNote: jest.fn(),
  getNote: jest.fn(),
  updateNote: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams(),
}));

describe("NoteEditor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({});
    mockEditor.document = [{ type: "paragraph", content: [] }];
    // Restore replaceBlocks implementation after clearAllMocks
    mockEditor.replaceBlocks.mockImplementation((oldBlocks, newBlocks) => {
      mockEditor.document = newBlocks;
    });
  });

  test("creates a note and navigates back to the dashboard", async () => {
    const user = userEvent.setup();
    createNote.mockResolvedValueOnce({ success: true });
    render(<NoteEditor />);

    await user.type(screen.getByLabelText("Title"), "  New idea  ");
    await user.type(screen.getByTestId("content-input"), "A useful thought");
    expect(screen.getByText("3 words")).toBeInTheDocument();
    expect(screen.getByText("16 characters")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Save note" }));

    await waitFor(() => {
      expect(createNote).toHaveBeenCalledWith({
        title: "New idea",
        content: JSON.stringify([
          {
            type: "paragraph",
            content: [{ type: "text", text: "A useful thought", styles: {} }],
          },
        ]),
      });
    });
    expect(mockNavigate).toHaveBeenCalledWith("/notes", { replace: true });
  });

  test("validates empty fields without calling the service", async () => {
    const user = userEvent.setup();
    render(<NoteEditor />);

    await user.type(screen.getByLabelText("Title"), " ");
    // Don't type content to simulate empty content
    await user.click(screen.getByRole("button", { name: "Save note" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Title and content are required",
    );
    expect(createNote).not.toHaveBeenCalled();
  });

  test("navigates back with the back and cancel buttons", async () => {
    const user = userEvent.setup();
    render(<NoteEditor />);

    await user.click(screen.getByRole("button", { name: /Back to notes/ }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(mockNavigate).toHaveBeenNthCalledWith(1, "/notes");
    expect(mockNavigate).toHaveBeenNthCalledWith(2, "/notes");
  });

  test("loads and updates an existing note", async () => {
    const user = userEvent.setup();
    mockUseParams.mockReturnValue({ id: "12" });
    const oldContent = JSON.stringify([
      {
        type: "paragraph",
        content: [{ type: "text", text: "Old content", styles: {} }],
      },
    ]);
    getNote.mockResolvedValueOnce({
      note: { title: "Old title", content: oldContent },
    });
    updateNote.mockResolvedValueOnce({ success: true });
    render(<NoteEditor />);

    expect(await screen.findByDisplayValue("Old title")).toBeInTheDocument();
    await user.clear(screen.getByLabelText("Title"));
    await user.type(screen.getByLabelText("Title"), "Updated title");
    await user.click(screen.getByRole("button", { name: "Update note" }));

    await waitFor(() => {
      expect(updateNote).toHaveBeenCalledWith("12", {
        title: "Updated title",
        content: JSON.stringify([
          {
            type: "paragraph",
            content: [{ type: "text", text: "Old content", styles: {} }],
          },
        ]),
      });
    });
  });

  test("shows load and save errors", async () => {
    const user = userEvent.setup();
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockUseParams.mockReturnValue({ id: "12" });
    getNote.mockRejectedValueOnce(new Error("Unable to load note"));
    render(<NoteEditor />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to load note",
    );
    await user.type(screen.getByLabelText("Title"), "Title");
    await user.type(screen.getByTestId("content-input"), "Content");
    updateNote.mockRejectedValueOnce(new Error("Save failed"));
    await user.click(screen.getByRole("button", { name: "Update note" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Save failed");
    consoleError.mockRestore();
  });
});
