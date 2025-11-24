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

// 2. API TO GET ALL MOVIES
router.get("/", async (req, res) => {
  try {
    const { search, genre, sort } = req.query;
    let query = {};

    // Search logic
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    // Execute Query
    const result = await movies().find(query).toArray();

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. API TO GET SINGLE MOVIE DETAILS
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid ID" });

    const movie = await movies().findOne({ _id: new ObjectId(id) });

    if (!movie) return res.status(404).json({ message: "Movie not found" });

    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. API TO UPDATE MOVIE DETAILS
router.put("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid ID" });

    const updateInfo = {
      $set: req.body,
    };

    const result = await movies().updateOne(
      { _id: new ObjectId(id) },
      updateInfo
    );

    if (result.matchedCount === 0)
      return res.status(404).json({ message: "Movie not found" });

    res.status(200).json({ success: true, message: "Movie updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. API TO DELETE MOVIE
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid ID" });

    const result = await movies().deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0)
      return res.status(404).json({ message: "Movie not found" });

    res.status(200).json({ success: true, message: "Movie deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. API TO ADD TO MY COLLECTIONS
router.post("/my-collection", async (req, res) => {
  try {
    const { movieId, userEmail, notes } = req.body;

    // Check if movie exists
    const movie = await movies().findOne({ _id: new ObjectId(movieId) });
    if (!movie)
      return res.status(404).json({ message: "Movie does not exist" });

    const favoriteItem = {
      userEmail,
      movieId: new ObjectId(movieId),
      movieTitle: movie.title,
      notes: notes || "",
      addedAt: new Date(),
    };

    // Prevent duplicates
    const exists = await favorites().findOne({
      userEmail,
      movieId: new ObjectId(movieId),
    });
    if (exists)
      return res.status(400).json({ message: "Already in favorites" });

    const result = await favorites().insertOne(favoriteItem);
    res.status(201).json({ success: true, message: "Added to favorites" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
