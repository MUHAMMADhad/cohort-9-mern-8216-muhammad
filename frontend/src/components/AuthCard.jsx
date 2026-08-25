import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import "../styles/Auth.css";

export const AuthCard = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname !== "/signup");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { handleLogin, handleRegister } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await handleLogin({
          email: formData.email,
          password: formData.password,
        });
        navigate("/notes", { replace: true });
      } else {
        await handleRegister(formData);
        setIsLogin(true);
        setFormData({ name: "", email: formData.email, password: "" });
      }
    } catch (submissionError) {
      setError(submissionError.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-container">
      <section className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">N</div>
          <h1 className="auth-title">
            {isLogin ? "Notes App" : "Create account"}
          </h1>
          <p>
            {isLogin
              ? "Enter your details to sign in"
              : "Get started with your free account"}
          </p>
        </div>
        {error && (
          <div className="alert-error" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <label className="form-field">
              <span>Full Name</span>
              <input
                className="form-input"
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </label>
          )}
          <label className="form-field">
            <span>Email Address</span>
            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>
          <label className="form-field">
            <span>Password</span>
            <input
              className="form-input"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>
        <div className="auth-toggle">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            type="button"
            className="btn-link"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </div>
      </section>
    </main>
  );
};
