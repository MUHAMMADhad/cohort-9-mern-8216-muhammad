const getBlocks = (content = "") => {
  try {
    const parsedContent = JSON.parse(content);
    if (Array.isArray(parsedContent)) return parsedContent;
  } catch {
    // Keep supporting notes saved before BlockNote was introduced.
  }

  return null;
};

const renderInlineContent = (content = [], keyPrefix = "text") =>
  content.map((item, index) => {
    if (item.type === "link") {
      return (
        <a
          key={`${keyPrefix}-${index}`}
          href={item.href}
          target="_blank"
          rel="noreferrer"
        >
          {renderInlineContent(
            item.content || [],
            `${keyPrefix}-link-${index}`,
          )}
        </a>
      );
    }
    if (item.type !== "text") return null;

    const styles = item.styles || {};
    const text = item.text || "";
    const style = {
      fontWeight: styles.bold ? 700 : undefined,
      fontStyle: styles.italic ? "italic" : undefined,
      textDecoration:
        [
          styles.underline ? "underline" : "",
          styles.strike ? "line-through" : "",
        ]
          .filter(Boolean)
          .join(" ") || undefined,
      color: styles.textColor !== "default" ? styles.textColor : undefined,
      backgroundColor:
        styles.backgroundColor !== "default"
          ? styles.backgroundColor
          : undefined,
      fontFamily: styles.code ? "monospace" : undefined,
    };

    return (
      <span key={`${keyPrefix}-${index}`} style={style}>
        {text}
      </span>
    );
  });

const renderBlocks = (blocks = []) =>
  blocks.map((block, index) => {
    const children = renderInlineContent(block.content, `block-${index}`);
    const nested = block.children?.length ? renderBlocks(block.children) : null;
    const content = (
      <>
        {children}
        {nested}
      </>
    );

    if (block.type === "heading") {
      const Heading = `h${Math.min(Math.max(block.props?.level || 1, 1), 6)}`;
      return <Heading key={block.id || index}>{content}</Heading>;
    }

    if (block.type === "bulletListItem") {
      return <li key={block.id || index}>{content}</li>;
    }

    if (block.type === "numberedListItem") {
      return <li key={block.id || index}>{content}</li>;
    }

    if (block.type === "checkListItem") {
      return (
        <label key={block.id || index}>
          <input type="checkbox" checked={block.props?.checked} readOnly />
          {content}
        </label>
      );
    }

    if (block.type === "toggleListItem") {
      return (
        <details key={block.id || index}>
          <summary>{content}</summary>
        </details>
      );
    }

    if (block.type === "quote") {
      return <blockquote key={block.id || index}>{content}</blockquote>;
    }

    return <div key={block.id || index}>{content}</div>;
  });

const getPlainContent = (content = "") => {
  const blocks = getBlocks(content);
  if (blocks) {
    return blocks
      .map((block) =>
        Array.isArray(block.content)
          ? block.content.map((item) => item.text || "").join("")
          : "",
      )
      .join(" ");
  }

  return content.replace(/<[^>]*>/g, "");
};

const NoteCard = ({ note, onEdit, onDelete }) => {
  const blocks = getBlocks(note.content);
  const plainContent = getPlainContent(note.content);
  const preview =
    plainContent.length > 150
      ? `${plainContent.substring(0, 150)}...`
      : plainContent;

  return (
    <article className="note-card">
      <div className="note-card-content">
        <h3>{note.title}</h3>

        {blocks ? (
          <div className="note-card-preview" data-testid="note-preview">
            {renderBlocks(blocks)}
          </div>
        ) : (
          <p className="note-card-preview" data-testid="note-preview">
            {preview}
          </p>
        )}

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
