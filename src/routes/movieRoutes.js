const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");

const router = express.Router();

// Helper to get collections easily
const movies = () => getDB().collection("movies");
const favorites = () => getDB().collection("favorites"); // For personal collections

// 1. API TO CREATE MOVIE
router.post("/add", async (req, res) => {
  try {
    const newMovie = req.body;

    // Basic Validation
    if (!newMovie.title || !newMovie.genre || !newMovie.rating) {
      return res
        .status(400)
        .json({ message: "Title, Genre, and Rating are required" });
    }

    // Insert into DB
    const result = await movies().insertOne(newMovie);
    res.status(201).json({ success: true, id: result.insertedId, ...newMovie });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
