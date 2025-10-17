import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function RegisterPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Please fill in all fields");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post("/api/register", form);
      window.location.href = "/login";
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">🆕 Create Account</h2>
          <p className="auth-subtitle">Sign up to start tracking your attendance</p>
        </div>

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Choose a username"
              value={form.username}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Choose a strong password"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
            />
            <small style={{ color: "var(--text-tertiary)", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>
              Must be at least 6 characters
            </small>
          </div>

          {error && (
            <div style={{ color: "var(--danger)", marginBottom: "1rem", fontSize: "0.9rem" }}>
              {error}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
