import { useContext } from "react";
import { AuthContext } from "./context/AuthContext.jsx";
import { AuthCard } from "./components/AuthCard.jsx";

export default function App() {
  const { user, handleLogout } = useContext(AuthContext);

  // Show Auth Forms if user is not authenticated
  if (!user) {
    return <AuthCard />;
  }

  // Main App Dashboard placeholder when logged in
  return (
    <div style={{ padding: "3rem", textAlign: "center", color: "#f8fafc" }}>
      <h1>Welcome, {user.name}! 👋</h1>
      <p style={{ color: "#94a3b8" }}>You are authenticated with JWT.</p>
      <button
        onClick={handleLogout}
        style={{
          marginTop: "1.5rem",
          padding: "0.75rem 1.5rem",
          backgroundColor: "#ef4444",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "600",
        }}
      >
        Log Out
      </button>
    </div>
  );
}