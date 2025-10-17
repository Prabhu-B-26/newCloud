import React, { useState, useEffect } from "react";
import axios from "axios";

const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const studentId = localStorage.getItem("studentId");

function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendance, setAttendance] = useState([]);
  const [timetable, setTimetable] = useState({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    axios.get(`/api/timetable/${studentId}`).then((res) => {
      if (res.data?.timetable) setTimetable(res.data.timetable);
    });
  }, []);

  useEffect(() => {
    const weekday = days[new Date(selectedDate).getDay()];
    const todaySubjects = timetable[weekday] || [];
    const attData = todaySubjects.map((subject, i) => ({
      hour: i + 1,
      subject,
      status: "Absent",
    }));
    setAttendance(attData);
    setSaved(false);
  }, [selectedDate, timetable]);

  const toggleStatus = (index) => {
    const updated = [...attendance];
    updated[index].status = updated[index].status === "Present" ? "Absent" : "Present";
    setAttendance(updated);
    setSaved(false);
  };

  const submitAttendance = async () => {
    setLoading(true);
    try {
      await axios.post("/api/mark-attendance", {
        studentId,
        date: selectedDate,
        dailyAttendance: attendance,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      alert("Error submitting attendance: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const presentCount = attendance.filter(a => a.status === "Present").length;
  const totalCount = attendance.length;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">✅ Mark Attendance</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "0.5rem" }}>
          Track your daily class attendance
        </p>
      </div>

      <div className="date-selector">
        <label>Select Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        {totalCount > 0 && (
          <div style={{ marginLeft: "auto", padding: "0.5rem 1rem", background: "var(--bg-secondary)", borderRadius: "var(--radius)", fontSize: "0.9rem", fontWeight: 500 }}>
            {presentCount} / {totalCount} Present
          </div>
        )}
      </div>

      {attendance.length > 0 ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Hour</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((item, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: 600, color: "var(--text-secondary)" }}>
                    {item.hour}
                  </td>
                  <td style={{ fontWeight: 500 }}>{item.subject}</td>
                  <td>
                    <span className={item.status === "Present" ? "status-present" : "status-absent"}>
                      {item.status === "Present" ? "✓ Present" : "✗ Absent"}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-toggle"
                      onClick={() => toggleStatus(index)}
                      style={{ 
                        background: item.status === "Present" ? "var(--success)" : "var(--danger)" 
                      }}
                    >
                      Toggle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <p>No timetable found for this day.</p>
          <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
            Please set up your timetable first.
          </p>
        </div>
      )}

      {attendance.length > 0 && (
        <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", alignItems: "center" }}>
          <button onClick={submitAttendance} disabled={loading}>
            {loading ? "Saving..." : "💾 Submit Attendance"}
          </button>
          {saved && (
            <span style={{ color: "var(--success)", fontSize: "0.9rem", fontWeight: 500 }}>
              ✓ Attendance saved successfully!
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default AttendancePage;
