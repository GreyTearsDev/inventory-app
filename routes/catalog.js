const express = require("express");
const router = express.Router();

// Require controller modules
const author_controller = require("../controllers/authorController");
const comic_controller = require("../controllers/comicController");

// Get home page
router.get("/", comic_controller.index);

// Author routes
module.exports = router;
