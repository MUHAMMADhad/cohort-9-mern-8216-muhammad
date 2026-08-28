import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { createNote, getNote, updateNote } from "../services/noteService.js";
import "../styles/NoteEditor.css";

// Pulls plain text out of BlockNote's block tree, for the live word/char count.
const blocksToPlainText = (blocks = []) => {
  const collect = (nodes) =>
    nodes
      .map((node) => {
        const inline = Array.isArray(node.content)
          ? node.content.map((c) => c.text || "").join("")
          : "";
        const children = node.children?.length ? collect(node.children) : "";
        return [inline, children].filter(Boolean).join(" ");
      })
      .join(" ");
  return collect(blocks).trim();
};

const EMPTY_DOCUMENT = [{ type: "paragraph", content: [] }];

const NoteEditor = () => {
  const { id: noteId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [initialContent, setInitialContent] = useState(undefined);
  const [plainText, setPlainText] = useState("");
  const [loading, setLoading] = useState(Boolean(noteId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(noteId);
  const wordCount = plainText
    ? plainText.split(/\s+/).filter(Boolean).length
    : 0;
  const charCount = plainText.length;

  const editor = useCreateBlockNote({
    initialContent: initialContent || EMPTY_DOCUMENT,
  });

  useEffect(() => {
    if (!noteId) {
      setLoading(false);
      return;
    }

    const loadNote = async () => {
      try {
        const response = await getNote(noteId);
        const note = response.note || response.data || response;
        setTitle(note.title || "");

        let parsedBlocks = EMPTY_DOCUMENT;
        if (note.content) {
          try {
            const parsed = JSON.parse(note.content);
            parsedBlocks = Array.isArray(parsed) ? parsed : EMPTY_DOCUMENT;
          } catch {
            // Legacy plain-text notes: wrap the raw string as a single paragraph.
            parsedBlocks = [
              {
                type: "paragraph",
                content: [{ type: "text", text: note.content, styles: {} }],
              },
            ];
          }
        }
        setInitialContent(parsedBlocks);
        setPlainText(blocksToPlainText(parsedBlocks));
      } catch (loadError) {
        setError(loadError.message || "Unable to load note");
      } finally {
        setLoading(false);
      }
    };

    loadNote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  // Once the fetched note content is ready, load it into the editor.
  useEffect(() => {
    if (initialContent && editor) {
      editor.replaceBlocks(editor.document, initialContent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialContent]);

  const handleEditorChange = () => {
    setPlainText(blocksToPlainText(editor.document));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const contentText = blocksToPlainText(editor.document);

    if (!title.trim() || !contentText) {
      setError("Title and content are required");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const noteData = {
        title: title.trim(),
        content: JSON.stringify(editor.document),
      };
      if (isEditing) await updateNote(noteId, noteData);
      else await createNote(noteData);
      navigate("/notes", { replace: true });
    } catch (saveError) {
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
        <div
          className="note-content-input note-blocknote-wrapper"
          id="note-content"
        >
          <BlockNoteView
            editor={editor}
            onChange={handleEditorChange}
            theme="light"
          />
        </div>

        <div className="editor-meta">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
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
