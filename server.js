const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("./src/config/db");
const movieRoutes = require("./src/routes/movieRoutes");
const admin = require("firebase-admin");

const decoded = Buffer.from(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
  "base64"
).toString("utf8");
const serviceAccount = JSON.parse(decoded);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database then start server
connectDB().then(() => {
  // Routes
  app.use("/api/movies", movieRoutes);

  app.get("/", (req, res) => {
    res.send("🎬 Movie Management API is Running...");
  });

  app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
  });
});
