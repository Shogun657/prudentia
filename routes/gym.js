const express = require("express");
const router = express.Router();
const flash = require("connect-flash");
const { isLoggedIn, setCurrentPage, isGymAuthor } = require("../middleware");
const { Gym } = require("../models/gym");
const multer = require("multer");
const { storage } = require("../cloudinary/index");
const upload = multer({ storage });
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

mbxGeocoding({ accessToken: mapBoxToken });

router.get("/gyms", setCurrentPage, isLoggedIn, async (req, res) => {
  try {
    const gyms = await Gym.find({});
    res.render("gym/index", { gyms });
  } catch (err) {
    console.error("Error:", err);
    req.flash("error", "Failed to fetch gyms");
    res.redirect("back");
  }
});

// New route - Display form to create a new gym
router.get("/gyms/new", isLoggedIn, setCurrentPage, (req, res) => {
  res.render("gym/new");
});

// Create route - Create a new gym
router.post(
  "/gyms",
  setCurrentPage,
  isLoggedIn,
  upload.array("images"),

  async (req, res) => {
    const geoData = await geocoder
      .forwardGeocode({
        query: req.body.location,
        limit: 1,
      })
      .send();

    try {
      const { title, location, price, description } = req.body;

      const images = req.files.map((file) => ({
        url: file.path,
        filename: file.filename,
      }));

      const newGym = new Gym({
        title,
        location,
        geometry: geoData.body.features[0].geometry,

        price,
        description,
        images,
        author: req.user._id,
      });

      await newGym.save();

      req.flash("success", "Successfully created a new gym!");
      res.redirect(`/gyms`);
    } catch (err) {
      console.error("Error:", err);
      req.flash("error", "Failed to create a new gym");
      res.redirect("back");
    }
  }
);

// Show route - Display details of a specific gym
router.get("/gyms/:id", setCurrentPage, isLoggedIn, async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id).populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    });
    if (!gym) {
      req.flash("error", "Gym not found");
      return res.redirect("/gyms");
    }
    console.log(gym);
    res.render("gym/show", { gym });
  } catch (err) {
    console.error("Error:", err);
    req.flash("error", "Failed to fetch gym details");
    res.redirect("/gyms");
  }
});

// Edit route - Display form to edit a specific gym
router.get("/gyms/:id/edit", setCurrentPage, isLoggedIn, isGymAuthor, async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id);
    if (!gym) {
      req.flash("error", "Gym not found");
      return res.redirect("/gyms");
    }
    res.render("gym/edit", { gym });
  } catch (err) {
    console.error("Error:", err);
    req.flash("error", "Failed to fetch gym details");
    res.redirect("/gyms");
  }
});

// Update route - Update a specific gym
router.put("/gyms/:id", setCurrentPage, isLoggedIn, isGymAuthor, upload.array("images"), async (req, res) => {
  try {
    const { id } = req.params;
    const {title, description, price, location} = req.body;
    const geoData = await geocoder
    .forwardGeocode({
      query: req.body.location,
      limit: 1,
    })
    .send();

    const gym = await Gym.findByIdAndUpdate(
      id,
      {geometry: geoData.body.features[0].geometry},

      {title, description, price, location},

      { new: true }
    );

    // Optionally, handle image uploads separately if req.files exists
      // Assuming you have a field named 'images' in your form
      if (req.files && req.files.length > 0) {
        const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
        gym.images.push(...imgs);
      }

      await gym.save()
    // Handle image deletion if req.body.deleteImages is present
    if (req.body.deleteImages) {
      for (let filename of req.body.deleteImages) {
        // Delete the image from your storage or CDN
        // This is just a placeholder
        console.log("Deleting image:", filename);
        await cloudinary.uploader.destroy(filename);
      }
    }  
    await gym.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    console.log(gym)

    req.flash("success", "Successfully updated the gym!");
    res.redirect(`/gyms/${gym._id}`);
  } catch (err) {
    console.error("Error:", err);
    req.flash("error", "Failed to update the gym");
    res.redirect("/gyms");
  }
});

// Delete route - Delete a specific gym
router.delete("/gyms/:id", setCurrentPage, isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    await Gym.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted the gym!");
    res.redirect("/gyms");
  } catch (err) {
    console.error("Error:", err);
    req.flash("error", "Failed to delete the gym");
    res.redirect("/gyms");
  }
});

module.exports = router;
