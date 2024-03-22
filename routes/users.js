const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const { storeReturnTo, setCurrentPage } = require("../middleware");

// Register route
router.get("/register", setCurrentPage, (req, res) => {
  res.render("users/register");
});

router.post(
  "/register",
  setCurrentPage,
  catchAsync(async (req, res) => {
    const { username, email, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Fitfinity!");
      res.redirect("/journals");
    });
  })
);

// Login route
router.get("/login", setCurrentPage, (req, res) => {
  res.render("users/login");
});

router.post(
  "/login",
  setCurrentPage,
  storeReturnTo,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    req.flash("success", "Welcome back!");
    const redirectUrl = res.locals.returnTo || "/journals";
    res.redirect(redirectUrl);
  }
);

// Logout route
router.get("/logout", setCurrentPage, (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Goodbye!");
    res.redirect("/journals");
  });
});

module.exports = router;
