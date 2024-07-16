const Genre = require("../models/genre");
const Comic = require("../models/comic");
const {ObjectId} = require("mongoose").Types
const asyncHandler = require("express-async-handler");

// List all currently available genres
exports.genre_list = asyncHandler(async (req, res, next) => {
  const allGenres = await Genre.find().sort({ name: 1 }).exec();

  res.render("genre_list", { title: "Genres", genre_list: allGenres });
});

exports.genre_detail = asyncHandler(async (req, res, next) => {
  const genreId = req.params.id
  const [genre, comicsOfGenre ]= await Promise.all([
    Genre.findById(genreId).exec(),
    Comic.find({ genres: genreId }, "title").exec()
  ]) ;

  if (!genre) {
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  res.render("genre_detail", { 
    title: "Genre Detail", 
    genre: genre, 
    comic_list: comicsOfGenre 
  }) 
})
