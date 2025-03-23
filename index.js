const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

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

app.get("/", (req, res) => {
  res.send("Welcome to my Lacrosse Events API!");
});

// API endpoint to get upcoming events (max 5)
app.get("/api/upcoming-events", (req, res) => {
  // Assuming dates are stored in YYYY-MM-DD
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

// API endpoint to create/update an event (use POST for create, PUT for update)
app.post("/api/events", (req, res) => {
  const { title, location, date, time, description } = req.body;
  if (!title || !location || !date) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  db.run(
    `INSERT INTO events (title, location, date, time, description)
     VALUES (?, ?, ?, ?, ?)`,
    [title, location, date, time, description],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID });
    }
  );
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
/*    
    The server.js file contains the server-side code to create an Express server, connect to a SQLite database, and define two API endpoints: 
    
    GET /api/upcoming-events  – This endpoint fetches the upcoming events from the database and returns a JSON response containing the list of upcoming events. 
    POST /api/events  – This endpoint creates a new event in the database. It expects a JSON payload containing the event details (title, location, date, time, description). 
    
    The  /api/events  endpoint uses the  INSERT INTO  SQL query to insert a new event into the database. The  lastID  property of the  this  object is used to return the ID of the newly created event. 
    Step 4: Create a React Frontend 
    Now, let’s create a React frontend to interact with the Express server and display the list of upcoming events. 
    Create a new React app using Create React App: 
    npx create-react-app event-app 
    Next, install Axios to make HTTP requests to the server: 
    cd event-app
*/
