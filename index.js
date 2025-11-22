// src/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

//const { connectDB } = require("./db");
//const itemsRoutes = require("./routes/items");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// routes
//app.use("/api/items", itemsRoutes);

// health
app.get("/", (req, res) =>
  res.json({ status: "ok", uptime: process.uptime() })
);

// start server + connect DB
(async () => {
  try {
    //await connectDB();
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();
