const { JournalEntry } = require("./models/journal");
const { Review } = require("./models/review");
const { Gym } = require("./models/gym");
const { RecEntry } = require('./models/recs')

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};
module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};
module.exports.isJournalAuthor = async (req, res, next) => {
  const { id } = req.params;
  console.log(id)
  const journal = await JournalEntry.findById(id).populate('author');
  console.log(journal)
  if(!journal.author.equals(req.user._id)){
    return res.redirect(`/journals/${journal._id}`)
  }
  next();
};
module.exports.isGymAuthor = async (req, res, next) => {
  const { id } = req.params;
  const gym = await Gym.findById(id);
  console.log(gym)
  if(gym.author && !gym.author.equals(req.user._id)){
    return res.redirect(`/gyms/${gym._id}`)
  }
  next();
};
module.exports.isRecAuthor = async (req, res, next) => {
  const { id } = req.params;
  const rec = await RecEntry.findById(id);
  console.log(rec)
  if(!rec.author.equals(req.user._id)){
    return res.redirect(`/recs/${rec._id}`)
  }
  next();
};
// change the spelling
module.exports.vaidateJournal = (req, res, next) => {
  const result = JournalEntry.validate(req.body);
  const { error } = result;
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 404);
  } else {
    next();
  }
};
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const message = error.details.map((el) => el.message).join(",");
    //throw new ExpressError(msg,404)
  } else {
    next();
  }
};
module.exports.reviewAuthor = async (req, res, next) => {
  const { id, reviewid } = req.params;
  console.log("meow");
  console.log(reviewid);
  const review = await Review.findById(reviewid);
  console.log(review);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that");
    return res.redirect(`/gyms/${id}`);
  }
  next();
};
// Define a middleware function to set currentPage variable based on the URL
module.exports.setCurrentPage = (req, res, next) => {
  // Get the current pathname from the URL
  const currentPath = req.originalUrl;

  // Define a function to extract the page name from the pathname
  function getPageName(path) {
    // Remove leading slash and split the pathname by '/'
    const parts = path.slice(1).split("/");
    // Return the first part of the split path
    return parts[0];
  }

  // Set the currentPage variable based on the page name
  res.locals.currentPage = getPageName(currentPath);

  // Call next middleware in the chain
  next();
};

module.exports.setGreeting = (req, res, next) => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0"); // Get hours and pad with leading zero if necessary

  // console.log(hours); // Output: Current time in 24-hour format (HH:mm:ss)

  const getGreeting = () => {
    if (hours >= 6 && hours <= 11) {
      return "Good Morning";
    } else if (hours >= 12 && hours <= 16) {
      return "Good Afternoon";
    } else if (hours > 16 && hours <= 19) {
      return "Good Evening";
    } else {
      return "Good Night";
    }
  };
  res.locals.greeting = getGreeting();
  next();
};

// Export the middleware function
