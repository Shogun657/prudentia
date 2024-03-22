const express = require("express");
const router = express.Router();

const {
  isLoggedIn,
  setGreeting,
  setCurrentPage,
  isJournalAuthor,
} = require("../middleware");
const { JournalEntry } = require("../models/journal");

const multer = require("multer");
const { storage } = require("../cloudinary/index");
const upload = multer({ storage });

// Index page
router.get(
  "/journals",
  isLoggedIn,
  setCurrentPage,
  setGreeting,
  async (req, res) => {
    try {
      const journals = await JournalEntry.find({});
      res.render("journals/index", { journals });
    } catch (err) {
      req.flash("error", "Failed to fetch journal entries");
      console.log(err);
      res.redirect("/home");
    }
  }
);
// router.post("/journals", setCurrentPage, upload.single("image"), (req, res) => {
//   res.send(req.body, req.file);
// });

// Show All Journal Entries
router.get(
  "/journals/new",
  isLoggedIn,
  setCurrentPage,
  setGreeting,
  (req, res) => {
    res.render("journals/new");
  }
);

// POST route for New Journal Entry
router.post(
  "/journals",
  setCurrentPage,
  upload.array("images"),
  async (req, res) => {
    try {
      const { title, content } = req.body;
      console.dir(req.body);
      const images = req.files.map((file) => ({
        url: file.path,
        filename: file.filename,
      }));

      const newJournalEntry = new JournalEntry({
        title,
        content,
        images,
        author: req.user._id,
      });
      console.log(req.user._id);
      newJournalEntry.author = req.user._id;
      await newJournalEntry.save();

      req.flash("success", "Journal entry created successfully");
      res.redirect("/journals");
    } catch (err) {
      console.error(err);
      req.flash("error", "Failed to create journal entry");
      res.redirect("journals/new");
    }
  }
);

// Show page
router.get(
  "/journals/:id",
  isJournalAuthor,
  isLoggedIn,
  setCurrentPage,
  async (req, res) => {
    try {
      const journalEntry = await JournalEntry.findById(req.params.id).populate(
        "author"
      );
      console.log("heil");
      console.log(journalEntry);
      res.render("journals/show", { journalEntry });
    } catch (err) {
      console.log(err);
      req.flash("error", "Failed to fetch journal entry");
      res.redirect("/journals");
    }
  }
);

// Update Route
router.get(
  "/journals/:id/edit",
  isLoggedIn,
  setCurrentPage,
  isJournalAuthor,
  async (req, res) => {
    try {
      const journal = await JournalEntry.findById(req.params.id).populate(
        "author"
      );
      res.render("journals/edit", { journal }); // Assuming your EJS file is named editJournalEntry.ejs
    } catch (err) {
      console.error(err);
      req.flash("error", "Failed to fetch journal entry for editing");
      res.redirect("/journals");
    }
  }
);

router.put(
  "/journals/:id",
  isLoggedIn,
  isJournalAuthor,
  setCurrentPage,
  upload.array("images"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content } = req.body; // Extract title and content from req.body
      // Find the journal entry by ID and update only title and content fields
      const updatedJournal = await JournalEntry.findByIdAndUpdate(
        id,
        { title, content },
        { new: true }
      );

      // Optionally, handle image uploads separately if req.files exists
      // Assuming you have a field named 'images' in your form
      if (req.files && req.files.length > 0) {
        const imgs = req.files.map((f) => ({
          url: f.path,
          filename: f.filename,
        }));
        updatedJournal.images.push(...imgs);
      }
      await updatedJournal.save();
      // Handle image deletion if req.body.deleteImages is present
      if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
          // Delete the image from your storage or CDN
          // This is just a placeholder
          console.log("Deleting image:", filename);
        }
        // Update the journal entry to remove the deleted images
        await updatedJournal.updateOne({
          $pull: { images: { filename: { $in: req.body.deleteImages } } },
        });
      }

      req.flash("success", "Journal entry updated successfully");
      res.redirect(`/journals/${id}`);
    } catch (err) {
      console.error(err);
      req.flash("error", "Failed to update journal entry");
      res.redirect(`/journals/${req.params.id}/edit`);
    }
  }
);

// module.exports.updateCampground = async (req, res) => {
//   const { id } = req.params;
//   console.log(req.body);
//   const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
//   const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
//   campground.images.push(...imgs);
//   await campground.save();
//   if (req.body.deleteImages) {
//       for (let filename of req.body.deleteImages) {
//           await cloudinary.uploader.destroy(filename);
//       }
//       await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
//   }
//   req.flash('success', 'Successfully updated campground!');
//   res.redirect(`/campgrounds/${campground._id}`)
// }

router.delete("/journals/:id", isLoggedIn, async (req, res) => {
  try {
    await JournalEntry.findByIdAndDelete(req.params.id);
    res.redirect("/journals");
  } catch (err) {
    req.flash("error", "Failed to delete journal entry");
    res.redirect(`/journals/${req.params.id}`);
  }
});
module.exports = router;
