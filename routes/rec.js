const express = require("express");
const router = express.Router();
const { isLoggedIn, setGreeting, setCurrentPage, isRecAuthor } = require("../middleware");
const { RecEntry } = require("../models/recs");


// Index page
router.get("/recs", isLoggedIn, setCurrentPage, setGreeting, async (req, res) => {
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
router.get(
    "/recs/new",
    isLoggedIn,
    setCurrentPage,
    setGreeting,
    (req, res) => {
        res.render("recs/new");
    }
);


// POST route for New Recommendation Entry
router.post(
    "/recs",
    setCurrentPage,
    async (req, res) => {
        try {
            const { title, content,tags } = req.body;
            const tagsArray = tags.split(',');
            console.dir(req.body)
            console.log(tagsArray)
            const recEntry = new RecEntry({
                title,
                content,
                tagsArray,
                author: req.user._id,
            });
            console.log(req.user._id);
            recEntry.author = req.user._id;
            await recEntry.save();

            req.flash("success", "Recommendation created successfully");
            res.redirect("/recs");
        } catch (err) {
            console.error(err);
            req.flash("error", "Failed to create recommendation entry");
            res.redirect("recs/new");
        }
    }
);

// Show page
router.get("/recs/:id", isRecAuthor, isLoggedIn, setCurrentPage, async (req, res) => {
    try {
        const recEntry = await RecEntry.findById(req.params.id).populate('author');
        res.render("recs/show", { recEntry });
    } catch (err) {
        req.flash("error", "Failed to fetch Rec entry");
        res.redirect("/recs");
    }
});

// Update Route
router.get("/recs/:id/edit", isLoggedIn, setCurrentPage, isRecAuthor, async (req, res) => {
    try {
        const rec = await RecEntry.findById(req.params.id).populate('author');
        res.render("recs/edit", { rec }); // Assuming your EJS file is named editrecEntry.ejs
    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to fetch rec entry for editing");
        res.redirect("/recs");
    }
});

// Update Route
router.get("/recs/:id/edit", isLoggedIn, setCurrentPage, isRecAuthor, async (req, res) => {
    try {
        const rec = await RecEntry.findById(req.params.id).populate('author');
        res.render("recs/edit", { rec }); // Assuming your EJS file is named editrecEntry.ejs
    } catch (err) {
        console.error(err);
        req.flash("error", "Failed to fetch rec entry for editing");
        res.redirect("/recs");
    }
});


router.put("/recs/:id", isLoggedIn, isRecAuthor, 
    async (req, res) => {
        try {
            const { id } = req.params;
            const { title, content } = req.body; // Extract title and content from req.body
            // Find the rec entry by ID and update only title and content fields
            const updatedrec = await RecEntry.findByIdAndUpdate(id, { title, content }, { new: true });

            // Optionally, handle image uploads separately if req.files exists
            // Assuming you have a field named 'images' in your form
            if (req.files && req.files.length > 0) {
                const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
                updatedrec.images.push(...imgs);
            }
            await updatedrec.save()
            // Handle image deletion if req.body.deleteImages is present
            if (req.body.deleteImages) {
                for (let filename of req.body.deleteImages) {
                    // Delete the image from your storage or CDN
                    // This is just a placeholder
                    console.log("Deleting image:", filename);
                }
                // Update the rec entry to remove the deleted images
                await updatedrec.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
            }


            req.flash("success", "rec entry updated successfully");
            res.redirect(`/recs/${id}`);
        } catch (err) {
            console.error(err);
            req.flash("error", "Failed to update rec entry");
            res.redirect(`/recs/${req.params.id}/edit`);
        }
    });

    module.exports = router;