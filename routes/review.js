const express = require("express");
const router = express.Router();
const { Gym } = require("../models/gym");
const { Review } = require("../models/review");
const { isLoggedIn, reviewAuthor } = require("../middleware");

// Create a new review
router.post("/gyms/:id/reviews", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const gym = await Gym.findById(id);
    const { rating, body } = req.body;
    console.log(req.body);
    const review = new Review({
      rating: rating,
      body: body,
      author: req.user._id,
    });

    gym.reviews.push(review);
    await review.save();
    await gym.save();
    req.flash("success", "Created new review");
    res.redirect(`/gyms/${gym._id}`);
  } catch (error) {
    console.error(error);
    req.flash("error", "Failed to create a new review");
    res.redirect(`/gyms/${req.params.id}`);
  }
});

// Delete a review
router.delete(
  "/gyms/:id/reviews/:reviewid",
  isLoggedIn,
  reviewAuthor,
  async (req, res) => {
    try {
      await Gym.findByIdAndUpdate(req.params.id, {
        $pull: { reviews: req.params.reviewid },
      });
      await Review.findByIdAndDelete(req.params.reviewid);
      req.flash("success", "Successfully deleted review");
      res.redirect(`/gyms/${req.params.id}`);
    } catch (error) {
      console.error(error);
      req.flash("error", "Failed to delete review");
      res.redirect(`/gyms/${req.params.id}`);
    }
  }
);

module.exports = router;
