const express = require("express");
const router = express.Router();

// Require controller modules
const author_controller = require("../controllers/authorController");
const comic_controller = require("../controllers/comicController");

// Get home page
router.get("/", comic_controller.index);

// Display list of all comics
router.get("/comics", comic_controller.comic_list);

// Author routes
module.exports = router;
