import { useEffect } from "react";

const UserProfile = ({ user, onClose, onLogout }) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const initials =
    user?.name  
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <div className="profile-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="profile-modal-header">
          <div>
            <span className="profile-kicker">ACCOUNT</span>
            <h2 id="profile-title">Your Profile</h2>
          </div>
          <button
            className="modal-close"
            type="button"
            onClick={onClose}
            aria-label="Close profile"
          >
            x
          </button>
        </div>

        <div className="profile-identity">
          <div className="profile-avatar">{initials}</div>
          <div>
            <h3>{user?.name || "Notes user"}</h3>
            <p>{user?.email || "No email available"}</p>
          </div>
        </div>

        <dl className="profile-details">
          <div>
            <dt>Full name</dt>
            <dd>{user?.name || "Not provided"}</dd>
          </div>
          <div>
            <dt>Email address</dt>
            <dd>{user?.email || "Not provided"}</dd>
          </div>
          <div>
            <dt>Member ID</dt>
            <dd>#{user?.id || "-"}</dd>
          </div>
        </dl>

        <button className="profile-logout" type="button" onClick={onLogout}>
          Log out
        </button>
      </section>
    </div>
  );
};

export default UserProfile;
