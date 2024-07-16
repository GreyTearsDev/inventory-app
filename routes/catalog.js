const express = require("express");
const router = express.Router();

// Require controller modules
const author_controller = require("../controllers/authorController");
const comic_controller = require("../controllers/comicController");
const genre_controller = require("../controllers/genreController");
const publisher_controller = require("../controllers/publisherController");

// == COMIC controller == //

// Get home page
router.get("/", comic_controller.index);

// Display list of all comics
router.get("/comics", comic_controller.comic_list);

// == AUTHOR controller == //
router.get("/authors", author_controller.author_list);

// == GENRE controller == //
router.get("/genres", genre_controller.genre_list);

// == PUBLISHER controller == //
router.get("/publishers", publisher_controller.publisher_list);

module.exports = router;
