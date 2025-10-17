import React, { useState, useEffect } from "react";
import axios from "axios";

const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
const studentId = localStorage.getItem("studentId");

function TimetablePage() {
  const [timetable, setTimetable] = useState(
    days.reduce((acc, day) => ({ ...acc, [day]: Array(8).fill("") }), {})
  );
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    axios.get(`/api/timetable/${studentId}`).then((res) => {
      if (res.data?.timetable) setTimetable(res.data.timetable);
    });
  }, []);

  const handleTimetableChange = (day, hour, value) => {
    const updated = { ...timetable };
    updated[day][hour] = value;
    setTimetable(updated);
    setSaved(false);
  };

  const saveTimetable = async () => {
    setLoading(true);
    try {
      await axios.post("/api/timetable", {
        studentId,
        timetable,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      alert("Error saving timetable: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">🗓️ Weekly Timetable</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "0.5rem" }}>
          Set up your class schedule for each day of the week (8 hours per day)
        </p>
      </div>

      {days.map((day) => (
        <div key={day} className="timetable-day">
          <h3 className="day-header">{day}</h3>
          <div className="timetable-inputs">
            {timetable[day].map((subject, hour) => (
              <input
                key={hour}
                type="text"
                className="timetable-input"
                placeholder={`Hour ${hour + 1}`}
                value={subject}
                onChange={(e) => handleTimetableChange(day, hour, e.target.value)}
              />
            ))}
          </div>
        </div>
      ))}

      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem", alignItems: "center" }}>
        <button onClick={saveTimetable} disabled={loading}>
          {loading ? "Saving..." : "💾 Save Timetable"}
        </button>
        {saved && (
          <span style={{ color: "var(--success)", fontSize: "0.9rem", fontWeight: 500 }}>
            ✓ Saved successfully!
          </span>
        )}
      </div>
    </div>
  );
}

export default TimetablePage;
