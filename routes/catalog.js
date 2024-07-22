const express = require("express");
const router = express.Router();

// Require controller modules
const author_controller = require("../controllers/authorController");
const comic_controller = require("../controllers/comicController");
const genre_controller = require("../controllers/genreController");
const publisher_controller = require("../controllers/publisherController");
const volume_controller = require("../controllers/volumeController");

// Get home page
router.get("/", comic_controller.index);

// == VOLUME controller == //
router.get("/volume/:id", volume_controller.volume_detail);

// == COMIC controller == //
router.get(
  "/comic/:id/volume/create",
  comic_controller.comic_volume_create_get,
);
router.post(
  "/comic/:id/volume/create",
  comic_controller.comic_volume_create_post,
);
router.get("/comic/create", comic_controller.comic_create_get);
router.post("/comic/create", comic_controller.comic_create_post);
router.get("/comic/:id", comic_controller.comic_detail);
router.get("/comics", comic_controller.comic_list);

// == AUTHOR controller == //
router.get("/author/create", author_controller.author_create_get);
router.post("/author/create", author_controller.author_create_post);
router.get("/author/:id/update", author_controller.author_update_get);
router.get("/author/:id", author_controller.author_detail);
router.get("/authors", author_controller.author_list);

// == GENRE controller == //
router.get("/genre/create", genre_controller.genre_create_get);
router.post("/genre/create", genre_controller.genre_create_post);
router.get("/genre/:id/update", genre_controller.genre_update_get);
router.post("/genre/:id/update", genre_controller.genre_update_post);
router.get("/genre/:id", genre_controller.genre_detail);
router.get("/genres", genre_controller.genre_list);

// == PUBLISHER controller == //
router.get("/publisher/create", publisher_controller.publisher_create_get);
router.post("/publisher/create", publisher_controller.publisher_create_post);
router.get("/publisher/:id/update", publisher_controller.publisher_update_get);
router.post(
  "/publisher/:id/update",
  publisher_controller.publisher_update_post,
);
router.get("/publisher/:id", publisher_controller.publisher_detail);
router.get("/publishers", publisher_controller.publisher_list);

module.exports = router;
