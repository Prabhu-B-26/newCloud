import React, { useState, useEffect } from "react";
import axios from "axios";

const studentId = localStorage.getItem("studentId");

function ReportPage() {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`/api/report/${studentId}`)
      .then((res) => {
        setReport(res.data);
        setLoading(false);
      })
      .catch(() => {
        alert("Error loading report");
        setLoading(false);
      });
  }, []);

  const totalPresent = report.reduce((sum, item) => sum + item.present, 0);
  const totalClasses = report.reduce((sum, item) => sum + item.total, 0);
  const overallPercentage = totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(2) : 0;

  const getPercentageColor = (percentage) => {
    if (percentage >= 75) return "var(--success)";
    if (percentage >= 60) return "var(--warning)";
    return "var(--danger)";
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📊 Attendance Report</h2>
        </div>
        <p style={{ textAlign: "center", color: "var(--text-secondary)" }}>Loading report...</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">📊 Attendance Report</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "0.5rem" }}>
          View your attendance statistics by subject
        </p>
      </div>

      {report.length > 0 ? (
        <>
          <div className="report-summary">
            <div className="stat-card">
              <div className="stat-value">{totalPresent}</div>
              <div className="stat-label">Classes Attended</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{totalClasses}</div>
              <div className="stat-label">Total Classes</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{overallPercentage}%</div>
              <div className="stat-label">Overall Attendance</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{report.length}</div>
              <div className="stat-label">Total Subjects</div>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Present</th>
                  <th>Total Classes</th>
                  <th>Attendance %</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {report.map((item) => {
                  const percentage = parseFloat(item.percentage);
                  return (
                    <tr key={item.subject}>
                      <td style={{ fontWeight: 600 }}>{item.subject}</td>
                      <td style={{ color: "var(--success)" }}>{item.present}</td>
                      <td>{item.total}</td>
                      <td>
                        <span style={{ 
                          fontWeight: 600, 
                          color: getPercentageColor(percentage) 
                        }}>
                          {item.percentage}%
                        </span>
                      </td>
                      <td>
                        {percentage >= 75 ? (
                          <span style={{ color: "var(--success)", fontSize: "0.9rem" }}>✓ Good</span>
                        ) : percentage >= 60 ? (
                          <span style={{ color: "var(--warning)", fontSize: "0.9rem" }}>⚠ Low</span>
                        ) : (
                          <span style={{ color: "var(--danger)", fontSize: "0.9rem" }}>✗ Critical</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ 
            marginTop: "1.5rem", 
            padding: "1rem", 
            background: "var(--bg-secondary)", 
            borderRadius: "var(--radius)",
            fontSize: "0.9rem",
            color: "var(--text-secondary)"
          }}>
            <strong>Note:</strong> Maintain at least 75% attendance to be eligible for exams.
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <p>No attendance data available.</p>
          <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
            Start marking your attendance to see the report.
          </p>
        </div>
      )}
    </div>
  );
}

export default ReportPage;
