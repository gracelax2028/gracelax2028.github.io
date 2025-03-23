const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Open (or create) a SQLite database file
const db = new sqlite3.Database("./events.db", (err) => {
  if (err) console.error(err.message);
  else console.log("Connected to the SQLite database.");
});

// Create events table if not exists
db.run(`CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT,
  description TEXT
)`);

// Root route: displays the events table in HTML
app.get("/", (req, res) => {
  db.all("SELECT * FROM events ORDER BY date ASC", [], (err, rows) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }
    let html = `<html><head>
      <title>Events Table</title>
      <style>
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f2f2f2; }
      </style>
      </head><body>`;
    html += `<h2>Events Table</h2>`;
    html += `<table>
             <tr>
               <th>ID</th>
               <th>Title</th>
               <th>Location</th>
               <th>Date</th>
               <th>Time</th>
               <th>Description</th>
             </tr>`;
    rows.forEach((row) => {
      html += `<tr>
                <td>${row.id}</td>
                <td>${row.title}</td>
                <td>${row.location}</td>
                <td>${row.date}</td>
                <td>${row.time || ""}</td>
                <td>${row.description || ""}</td>
              </tr>`;
    });
    html += `</table></body></html>`;
    res.send(html);
  });
});

// GET endpoint for upcoming events (max 5)
app.get("/api/upcoming-events", (req, res) => {
  db.all(
    `SELECT * FROM events WHERE date >= date('now') ORDER BY date ASC LIMIT 5`,
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ events: rows });
    }
  );
});

// POST endpoint for creating/updating an event (by date)
app.post("/api/events", (req, res) => {
  const { title, location, date, time, description } = req.body;
  if (!title || !location || !date) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  // Check if an event already exists for the given date
  db.get("SELECT * FROM events WHERE date = ?", [date], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row) {
      // Update existing event:
      db.run(
        "UPDATE events SET title = ?, location = ?, time = ?, description = ? WHERE date = ?",
        [title, location, time, description, date],
        function (err) {
          if (err) {
            res.status(500).json({ error: err.message });
          } else {
            res.json({ updated: true, id: row.id });
          }
        }
      );
    } else {
      // Insert new event:
      db.run(
        "INSERT INTO events (title, location, date, time, description) VALUES (?, ?, ?, ?, ?)",
        [title, location, date, time, description],
        function (err) {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json({ id: this.lastID });
        }
      );
    }
  });
});

// DELETE endpoint to remove an event by its date
app.delete("/api/events/:date", (req, res) => {
  const date = req.params.date;
  if (!date) {
    res.status(400).json({ error: "Date parameter is required" });
    return;
  }
  db.run("DELETE FROM events WHERE date = ?", [date], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: "No event found for this date" });
    } else {
      res.json({ deleted: true });
    }
  });
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
