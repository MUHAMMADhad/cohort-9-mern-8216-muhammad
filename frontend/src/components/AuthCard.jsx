import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import "../Auth.css";

/** @typedef {{ name: string, email: string, password: string }} FormData */

export const AuthCard = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState(
    /** @type {FormData} */ ({
      name: "",
      email: "",
      password: "",
    }),
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("AuthCard must be rendered inside AuthProvider");
  }
  const { handleLogin, handleRegister } = authContext;

  /** @param {import("react").ChangeEvent<HTMLInputElement>} e */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /** @param {import("react").FormEvent<HTMLFormElement>} e */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await handleLogin({
          email: formData.email,
          password: formData.password,
        });
      } else {
        await handleRegister(formData);
        setIsLogin(true);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Hero Side with Live Floating Preview */}
      <div className="auth-hero">
        <div className="brand-badge">✨ Enterprise Notes Workspace</div>
        <h1>
          Organize ideas <br />
          <span>without limits.</span>
        </h1>
        <p>
          Fast, reliable account access backed by secure authentication
          services.
        </p>

        <div className="preview-card">
          <div className="preview-icon">📝</div>
          <div>
            <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#fff" }}>
              Secure account authentication
            </h4>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>
              Sign in or create an account to continue
            </p>
          </div>
        </div>
      </div>

      {/* Glassmorphism Auth Card */}
      <div className="auth-card-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <h2>{isLogin ? "Welcome back" : "Get started"}</h2>
            <p>
              {isLogin
                ? "Enter your details to sign in."
                : "Create your account to start writing."}
            </p>
          </div>

          {error && (
            <div className="alert-error" role="alert">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="full-name">Full Name</label>
                <input
                  type="text"
                  id="full-name"
                  name="name"
                  className="form-input"
                  placeholder="Muhammad"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email-address">Email Address</label>
              <input
                type="email"
                id="email-address"
                name="email"
                className="form-input"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading
                ? "Authenticating..."
                : isLogin
                  ? "Sign In"
                  : "Create Account"}
            </button>
          </form>

          <div className="auth-toggle">
            {isLogin ? "Don't have an account?" : "Already registered?"}
            <button
              type="button"
              className="btn-link"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
