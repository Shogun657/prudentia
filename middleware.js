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