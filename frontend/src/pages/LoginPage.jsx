import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const res = await axios.post("/api/login", form);
      localStorage.setItem("studentId", form.username);
      window.location.href = "/timetable";
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">🔐 Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Enter your username"
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
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          {error && (
            <div style={{ color: "var(--danger)", marginBottom: "1rem", fontSize: "0.9rem" }}>
              {error}
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Create one</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
