const NoteCard = ({ note, onEdit, onDelete }) => {
  const plainContent = note.content.replace(/<[^>]*>/g, "");

  return (
    <article className="note-card">
      <div className="note-card-content">
        <h3>{note.title}</h3>

        <p>
          {plainContent.length > 150
            ? `${plainContent.substring(0, 150)}...`
            : plainContent}
        </p>

        <small>
          {new Date(note.updated_at || note.created_at).toLocaleDateString()}
        </small>
      </div>

      <div className="note-card-actions">
        <button onClick={() => onEdit(note.id)}>Edit</button>

        <button className="delete-button" onClick={() => onDelete(note.id)}>
          Delete
        </button>
      </div>
    </article>
  );
};

export default NoteCard;
