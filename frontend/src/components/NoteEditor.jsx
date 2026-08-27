import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createNote, getNote, updateNote } from "../services/noteService.js";
import "../styles/NoteEditor.css";

const NoteEditor = () => {
  const { id: noteId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(Boolean(noteId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(noteId);
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  useEffect(() => {
    if (!noteId) return;

    const loadNote = async () => {
      try {
        const response = await getNote(noteId);
        const note = response.note || response.data || response;
        setTitle(note.title || "");
        setContent(note.content || "");
      } catch (loadError) {
        setError(loadError.message || "Unable to load note");
      } finally {
        setLoading(false);
      }
    };

    loadNote();
  }, [noteId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const noteData = { title: title.trim(), content: content.trim() };

      // 1. Capture the network resolution promise completely
      let serverResponse;
      if (isEditing) {
        serverResponse = await updateNote(noteId, noteData);
      } else {
        serverResponse = await createNote(noteData);
      }

      // 2. Debug verification marker
      console.log("🚀 Database save confirmed by Express:", serverResponse);

      // 3. Only redirect once the asynchronous database query loop completely finishes
      navigate("/notes", { replace: true });
    } catch (saveError) {
      console.error("Failed to save note:", saveError);
      setError(saveError.message || "Unable to save note");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="editor-loading">Loading note...</div>;

  return (
    <main className="editor-container">
      <header className="editor-header">
        <button
          className="editor-back"
          type="button"
          onClick={() => navigate("/notes")}
        >
          <span aria-hidden="true">←</span> Back to notes
        </button>
        <div className="editor-heading">
          <span className="editor-kicker">
            {isEditing ? "EDIT NOTE" : "NEW NOTE"}
          </span>
          <h1>{isEditing ? "Edit note" : "Capture a thought"}</h1>
          <p>
            {isEditing
              ? "Make changes and keep your ideas moving."
              : "A simple space for the things worth remembering."}
          </p>
        </div>
      </header>

      {error && (
        <div className="editor-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="note-editor-form">
        <label className="editor-label" htmlFor="note-title">
          Title
        </label>
        <input
          id="note-title"
          className="note-title-input"
          type="text"
          placeholder="Give this note a clear title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        <label className="editor-label" htmlFor="note-content">
          Content
        </label>
        <textarea
          id="note-content"
          className="note-content-input"
          placeholder="Start writing your note..."
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={16}
          required
        />
        <div className="editor-meta">
          <span>{wordCount} words</span>
          <span>{content.length} characters</span>
        </div>
        <div className="editor-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate("/notes")}
            disabled={saving}
          >
            Cancel
          </button>
          <button type="submit" className="save-button" disabled={saving}>
            {saving ? "Saving..." : isEditing ? "Update note" : "Save note"}
          </button>
        </div>
      </form>
    </main>
  );
};

export default NoteEditor;
