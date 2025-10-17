import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import TimetablePage from "./pages/TimetablePage";
import AttendancePage from "./pages/AttendancePage";
import ReportPage from "./pages/ReportPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if the user is logged in (i.e., if studentId is in localStorage)
  useEffect(() => {
    const studentId = localStorage.getItem("studentId");
    if (studentId) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // Handle Logout
  const handleLogout = () => {
    // Clear the studentId from localStorage and update state
    localStorage.removeItem("studentId");
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <div className="app-container">
        {isLoggedIn && (
          <nav className="navbar">
            <div className="navbar-content">
              <div className="navbar-brand">📚 Attendance Tracker</div>
              <div className="navbar-links">
                <Link to="/timetable" className="nav-link">🗓️ Timetable</Link>
                <Link to="/attendance" className="nav-link">✅ Attendance</Link>
                <Link to="/report" className="nav-link">📊 Report</Link>
                <button onClick={handleLogout} className="btn-logout">
                  🚪 Logout
                </button>
              </div>
            </div>
          </nav>
        )}

        <main className={isLoggedIn ? "main-content" : ""}>
          <Routes>
            {!isLoggedIn ? (
              <>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/" element={<Navigate to="/login" />} />
              </>
            ) : (
              <>
                <Route path="/timetable" element={<TimetablePage />} />
                <Route path="/attendance" element={<AttendancePage />} />
                <Route path="/report" element={<ReportPage />} />
                <Route path="/" element={<Navigate to="/timetable" />} />
              </>
            )}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
