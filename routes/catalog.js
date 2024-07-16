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
router.get("/comics/:id", comic_controller.comic_detail);

// == AUTHOR controller == //
router.get("/authors", author_controller.author_list);
router.get("/authors/:id", author_controller.author_detail);

// == GENRE controller == //
router.get("/genres", genre_controller.genre_list);
router.get("/genres/:id", genre_controller.genre_detail);

// == PUBLISHER controller == //
router.get("/publishers", publisher_controller.publisher_list);
router.get("/publishers/:id", publisher_controller.publisher_detail);

module.exports = router;


