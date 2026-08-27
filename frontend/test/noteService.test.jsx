import {
  createNote,
  deleteNote,
  getNote,
  getNotes,
  updateNote,
} from "../src/services/noteService.js";

describe("noteService", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    Object.defineProperty(document, "cookie", {
      configurable: true,
      value: "csrf_token=test-token",
    });
  });

  test("gets all notes with credentials", async () => {
    const response = { notes: [{ id: 1, title: "First note" }] };
    fetch.mockResolvedValueOnce({ ok: true, json: async () => response });

    await expect(getNotes()).resolves.toEqual(response);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/notes"),
      expect.objectContaining({ credentials: "include" }),
    );
  });

  test("gets a note by id", async () => {
    const response = { note: { id: 7, title: "A note" } };
    fetch.mockResolvedValueOnce({ ok: true, json: async () => response });

    await expect(getNote(7)).resolves.toEqual(response);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/notes/7"),
      expect.any(Object),
    );
  });

  test.each([
    ["creates", createNote, undefined, { title: "Title", content: "Text" }],
    ["updates", updateNote, 7, { title: "Updated", content: "Text" }],
    ["deletes", deleteNote, 7, undefined],
  ])("$0 a note with the CSRF token", async (_label, service, id, body) => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    if (id) await service(id, body);
    else await service(body);

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        credentials: "include",
        headers: expect.objectContaining({ "X-CSRF-Token": "test-token" }),
      }),
    );
  });

  test("throws the server message for failed requests", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Note not found" }),
    });

    await expect(getNote(99)).rejects.toThrow("Note not found");
  });

  test("reports unavailable services", async () => {
    fetch.mockRejectedValueOnce(new Error("network down"));

    await expect(getNotes()).rejects.toThrow(
      "Failed to fetch notes: service unavailable",
    );
  });
});
