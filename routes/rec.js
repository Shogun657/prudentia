const express = require("express");
const router = express.Router();
const { isLoggedIn, setCurrentPage, isRecAuthor } = require("../middleware");
const { RecEntry } = require("../models/recs");
const multer = require("multer");
const { storage } = require("../cloudinary/index");
const upload = multer({ storage });
// Index page
router.get("/recs", isLoggedIn, setCurrentPage, async (req, res) => {
  try {
    const recs = await RecEntry.find({});
    res.render("recs/index", { recs });
  } catch (err) {
    req.flash("error", "Failed to fetch Rec entries");
    console.log(err);
    res.redirect("/home");
  }
});

// Add new Rec Entries
router.get("/recs/new", isLoggedIn, setCurrentPage, (req, res) => {
  res.render("recs/new");
});

// POST route for New Recommendation Entry
router.post("/recs", setCurrentPage, async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const tagsArray = tags.split(",");
    const recs = new RecEntry({
      title,
      content,
      tags: tagsArray,
      author: req.user._id,
    });
    await recs.save();
    req.flash("success", "Recommendation created successfully");
    res.redirect("/recs");
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to create recommendation entry");
    res.redirect("recs/new");
  }
});

// Show page
router.get(
  "/recs/:id",
  isRecAuthor,
  isLoggedIn,
  setCurrentPage,
  async (req, res) => {
    try {
      const recs = await RecEntry.findById(req.params.id).populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      });
      res.render("recs/show", { recs });
    } catch (err) {
      req.flash("error", "Failed to fetch Rec entry");
      res.redirect("/recs");
    }
  }
);

// Update Route
router.get(
  "/recs/:id/edit",
  isLoggedIn,
  setCurrentPage,
  isRecAuthor,
  async (req, res) => {
    try {
      const rec = await RecEntry.findById(req.params.id).populate("author");
      res.render("recs/edit", { rec });
    } catch (err) {
      console.error(err);
      req.flash("error", "Failed to fetch rec entry for editing");
      res.redirect("/recs");
    }
  }
);

router.put("/recs/:id", isLoggedIn, isRecAuthor, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const updatedrec = await RecEntry.findByIdAndUpdate(
      id,
      { title, content },
      { new: true }
    );

    req.flash("success", "rec entry updated successfully");
    res.redirect(`/recs/${id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to update rec entry");
    res.redirect(`/recs/${req.params.id}/edit`);
  }
});

module.exports = router;
