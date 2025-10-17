const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { BlobServiceClient } = require("@azure/storage-blob");
require("dotenv").config();

const app = express();
const PORT = 5000;

// Azure Storage setup
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);

// Containers you will use
const CONTAINERS = ["users", "attendance", "timetables"];
const containerClients = {};

// Ensure all containers exist
async function ensureContainersExist() {
  for (const name of CONTAINERS) {
    const client = blobServiceClient.getContainerClient(name);
    const exists = await client.exists();
    if (!exists) {
      await client.create();
      console.log(`Container "${name}" created`);
    }
    containerClients[name] = client;
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// Helper Functions
async function uploadBlob(containerName, blobName, data) {
  const client = containerClients[containerName];
  const blockBlobClient = client.getBlockBlobClient(blobName);
  const content = JSON.stringify(data);
  await blockBlobClient.upload(content, Buffer.byteLength(content));
}

async function downloadBlob(containerName, blobName) {
  const client = containerClients[containerName];
  try {
    const blockBlobClient = client.getBlockBlobClient(blobName);
    const downloadResponse = await blockBlobClient.download(0);
    const content = await streamToString(downloadResponse.readableStreamBody);
    return JSON.parse(content);
  } catch (error) {
    if (error.statusCode === 404) return null;
    throw error;
  }
}

async function deleteBlob(containerName, blobName) {
  const client = containerClients[containerName];
  const blockBlobClient = client.getBlockBlobClient(blobName);
  await blockBlobClient.delete();
}

async function listBlobs(containerName, prefix) {
  const client = containerClients[containerName];
  const blobs = [];
  for await (const blob of client.listBlobsFlat({ prefix })) {
    blobs.push(blob.name);
  }
  return blobs;
}

async function streamToString(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => chunks.push(data.toString()));
    readableStream.on("end", () => resolve(chunks.join("")));
    readableStream.on("error", reject);
  });
}

// Routes

app.get("/", (req, res) => {
  res.send("Backend is working!");
});

// User Registration
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await downloadBlob("users", username);
    if (existingUser) return res.status(400).json({ message: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { username, password: hashedPassword };
    await uploadBlob("users", username, user);
    res.json({ message: "User registered successfully", user: { username } });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(400).json({ message: "Registration failed", error: err.message });
  }
});

// User Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await downloadBlob("users", username);
    if (!user) return res.status(401).json({ message: "Invalid username or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid username or password" });

    res.json({ message: "Login successful", user: { username } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login error", error: err.message });
  }
});

// Mark Attendance
app.post("/mark-attendance", async (req, res) => {
  const { studentId, date, dailyAttendance } = req.body;
  if (!studentId || !date || !dailyAttendance) {
    return res.status(400).json({ message: "Missing fields" });
  }
  try {
    const blobName = `${studentId}/${date}`;
    await uploadBlob("attendance", blobName, { studentId, date, dailyAttendance });
    res.status(200).json({ message: "Attendance saved" });
  } catch (err) {
    console.error("Error saving attendance:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get Attendance
app.get("/attendance/:studentId/:date", async (req, res) => {
  try {
    const { studentId, date } = req.params;
    const blobName = `${studentId}/${date}`;
    const attendance = await downloadBlob("attendance", blobName);
    if (!attendance) return res.status(404).send("No attendance found");
    res.json(attendance);
  } catch (err) {
    console.error("Error fetching attendance:", err);
    res.status(500).send("Error fetching attendance");
  }
});

// Save Timetable
app.post("/timetable", async (req, res) => {
  const { studentId, timetable } = req.body;
  if (!studentId || !timetable) return res.status(400).json({ message: "Missing data" });
  try {
    await uploadBlob("timetables", studentId, { studentId, timetable });
    res.status(200).json({ message: "Timetable saved", data: { studentId, timetable } });
  } catch (err) {
    console.error("Error saving timetable:", err);
    res.status(500).json({ message: "Error saving timetable", error: err.message });
  }
});

// Get Timetable
app.get("/timetable/:studentId", async (req, res) => {
  try {
    const result = await downloadBlob("timetables", req.params.studentId);
    res.status(200).json(result || {});
  } catch (err) {
    console.error("Error fetching timetable:", err);
    res.status(500).json({ message: "Error fetching timetable", error: err.message });
  }
});

// Attendance Report
app.get("/report/:studentId", async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const records = [];
    const blobs = await listBlobs("attendance", `${studentId}/`);
    for (const blobName of blobs) {
      const record = await downloadBlob("attendance", blobName);
      if (record) records.push(record);
    }

    const subjectStats = {};
    for (const record of records) {
      for (const entry of record.dailyAttendance) {
        const { subject, status } = entry;
        if (!subject) continue;
        if (!subjectStats[subject]) subjectStats[subject] = { total: 0, present: 0 };
        subjectStats[subject].total += 1;
        if (status === "Present") subjectStats[subject].present += 1;
      }
    }

    const report = Object.entries(subjectStats).map(([subject, stats]) => ({
      subject,
      total: stats.total,
      present: stats.present,
      percentage: ((stats.present / stats.total) * 100).toFixed(2),
    }));

    res.json(report);
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).json({ message: "Error generating report", error: err.message });
  }
});

// Start server
ensureContainersExist().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
}).catch(err => {
  console.error("Error ensuring containers:", err);
});
