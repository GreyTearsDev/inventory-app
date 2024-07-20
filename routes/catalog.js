const express = require("express");
const router = express.Router();

// Require controller modules
const author_controller = require("../controllers/authorController");
const comic_controller = require("../controllers/comicController");
const genre_controller = require("../controllers/genreController");
const publisher_controller = require("../controllers/publisherController");
const volume_controller = require("../controllers/volumeController");

// == COMIC controller == //

// Get home page
router.get("/", comic_controller.index);

// Display list of all comics
router.get("/comic/:id", comic_controller.comic_detail);
router.get("/comics", comic_controller.comic_list);

// == AUTHOR controller == //
router.get("/author/:id", author_controller.author_detail);
router.get("/authors", author_controller.author_list);

// == GENRE controller == //
router.get("/genre/create", genre_controller.genre_create_get);
// router.post("/genre/create", genre_controller.genre_create_post);
router.get("/genre/:id", genre_controller.genre_detail);
router.get("/genres", genre_controller.genre_list);

// == PUBLISHER controller == //
router.get("/publisher/:id", publisher_controller.publisher_detail);
router.get("/publishers", publisher_controller.publisher_list);

// == VOLUME controller == //
router.get("/volume/:id", volume_controller.volume_detail);

module.exports = router;
