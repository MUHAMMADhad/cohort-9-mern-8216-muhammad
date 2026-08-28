import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNotes, deleteNote } from "../services/noteService";
import "../styles/Dashboard.css";
import NotesList from "../components/NotesList";
import { AuthContext } from "../context/AuthContext.jsx";
import UserProfile from "../components/UserProfile.jsx";

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const navigate = useNavigate();
  const { user, handleLogout } = useContext(AuthContext);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getNotes();

      setNotes(data.notes || data.data || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?",
    );

    if (!confirmed) return;

    try {
      await deleteNote(id);

      setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await handleLogout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const visibleNotes = [...notes]
    .filter((note) => {
      const query = search.trim().toLowerCase();
      if (!query) return true;
      return `${note.title} ${note.content}`.toLowerCase().includes(query);
    })
    .sort((first, second) => {
      if (filter === "oldest")
        return new Date(first.created_at) - new Date(second.created_at);
      if (filter === "title") return first.title.localeCompare(second.title);
      return (
        new Date(second.updated_at || second.created_at) -
        new Date(first.updated_at || first.created_at)
      );
    });

  if (loading) {
    return <div className="dashboard-loading">Loading notes...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <span className="dashboard-label">NOTENEST</span>
          <h1>My Notes</h1>
          <p>
            {user?.name
              ? `A calm place for ${user.name}'s ideas.`
              : "Keep your thoughts organized."}
          </p>
        </div>

        <div className="dashboard-actions">
          <button
            className="profile-trigger"
            type="button"
            onClick={() => setProfileOpen(true)}
            aria-label="Open user profile"
          >
            <span className="profile-trigger-avatar">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </span>
            <span className="profile-trigger-name">
              {user?.name || "Profile"}
            </span>
          </button>
          <button
            className="create-note-button"
            onClick={() => navigate("/notes/new")}
          >
            + New Note
          </button>
          <button className="logout-button" onClick={handleSignOut}>
            Log out
          </button>
        </div>
      </header>

      {error && <p className="dashboard-error">{error}</p>}

      <section className="notes-toolbar" aria-label="Search and filter notes">
        <label className="search-box">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Search your notes..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search notes"
          />
        </label>
        <label className="filter-box">
          <span>Sort by</span>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Sort notes"
          >
            <option value="all">Recently updated</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title A-Z</option>
          </select>
        </label>
      </section>

      {!error && notes.length === 0 ? (
        <div className="empty-state">
          <h3>No notes yet</h3>
          <p>Create your first note to get started.</p>
        </div>
      ) : visibleNotes.length === 0 ? (
        <div className="empty-state">
          <h3>No matching notes</h3>
          <p>Try a different search phrase.</p>
        </div>
      ) : (
        <NotesList
          notes={visibleNotes}
          onEdit={(id) => navigate(`/notes/${id}/edit`)}
          onDelete={handleDelete}
        />
      )}

      {profileOpen && (
        <UserProfile
          user={user}
          onClose={() => setProfileOpen(false)}
          onLogout={handleSignOut}
        />
      )}
    </div>
  );
};

export default Dashboard;
