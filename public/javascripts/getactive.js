const currentPath = window.location.pathname;

// Define a function to extract the page name from the pathname
function getPageName(path) {
  // Remove leading slash and split the pathname by '/'
  const parts = path.slice(1).split("/");
  // Return the first part of the split path
  return parts[0];
}

// Set the currentPage variable based on the page name
const currentPage = getPageName(currentPath);
